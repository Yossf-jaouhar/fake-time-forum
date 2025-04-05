package chat

import (
	"database/sql"
	"fmt"
	"sync"

	"github.com/gorilla/websocket"
)

type (
	Clients struct {
		Map map[string]*Client
		sync.RWMutex
	}
	Client struct {
		Conn map[*websocket.Conn]any
	}
	Message struct {
		Type string `json:"type"`
		Content  string `json:"content"`
		Reciever string `json:"reciever"`
		Sender   string `json:"sender"`
		SentAt   string `json:"sent_at"`
	}
)

func NewClients(db *sql.DB) *Clients {
	return &Clients{
		Map: make(map[string]*Client),
	}
}
func (c *Clients) ActiveSingal(nickname string, active string) {
	c.Lock()
	defer c.Unlock()
	for user, client := range c.Map {
		if user == nickname {
			continue
		}
		for conn := range client.Conn {
			conn.WriteJSON(map[string]string{
				"type":     "status",
				"active":   active,
				"name": nickname,
			})
		}
	}
}
func (c *Clients) GetClients(user string, db *sql.DB) []struct {
	Client string `json:"name"`
	State  string `json:"state"`
} {
	c.Lock()
	defer c.Unlock()
	res, err := db.Query(`SELECT nickname
	FROM users
	WHERE nickname != ?
	ORDER BY 
		(SELECT MAX(SentAt) 
		 FROM chat 
		 WHERE (sender = ? AND receiver = users.nickname) 
			OR (sender = users.nickname AND receiver = ?)) DESC,
		nickname ASC;
	`, user, user, user)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	defer res.Close()
	var clients []struct {
		Client string `json:"name"`
		State  string `json:"state"`
	}
	for res.Next() {
		var client string 
		res.Scan(&client)
		if c.Map[client] != nil && len(c.Map[client].Conn) > 0 {
			clients = append(clients, struct {
				Client string `json:"name"`
				State  string `json:"state"`
			}{client, "online"})
		} else {
			clients = append(clients, struct {
				Client string `json:"name"`
				State  string `json:"state"`
			}{client, ""})
		}
	}
	return clients
}
func (c *Clients) GetChat(user1, user2 string, start int, db *sql.DB) []Message {
	res, _ := db.Query(`SELECT content,sender,sent_at FROM chat WHERE (sender = ? AND reciever = ?) OR (sender = ? AND reciever = ?) ORDER BY sent_at LIMIT 10 WHERE id > ?`, user1, user2, user2, user1, start)
	if start == 0 {
		res, _ = db.Query(`SELECT content,sender,sent_at FROM chat WHERE (sender = ? AND reciever = ?) OR (sender = ? AND reciever = ?) ORDER BY sent_at LIMIT 10`, user1, user2, user2, user1)
	}
	var messages []Message
	for res.Next() {
		var msg Message
		res.Scan(&msg.Content, &msg.Sender, &msg.SentAt)
		messages = append(messages, msg)
	}
	return messages
}

func (c *Clients) SendMsg(msg *Message, db *sql.DB) (string,int) {
	c.Lock()
	for conn := range c.Map[msg.Reciever].Conn {
		err:=conn.WriteJSON(map[string]any{"type":msg.Type,"data":msg})
		if err!= nil {
			c.Unlock()
			return "err sending message" ,500
		}
	}
	c.Unlock()
	_, err := db.Exec(`INSERT INTO chat (sender,receiver,content) VALUE (?,?,?)`, msg.Sender, msg.Reciever, msg.Content)
	if err != nil {
		if err == sql.ErrNoRows {
			return "user doesnt exists",404
		}
		return "internal server error" ,500
	}
	return "",200
}
func (c *Clients)SendSingnals(msg *Message) string {
	c.Lock()
	for conn := range c.Map[msg.Reciever].Conn {
		err:=conn.WriteJSON(map[string]any{"type":msg.Type,"data":msg})
		if err!= nil {
			c.Unlock()
			return "err sending signal"
		}
	}
	c.Unlock()
	return ""
}
