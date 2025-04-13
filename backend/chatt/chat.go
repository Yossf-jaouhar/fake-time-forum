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
		Type     string `json:"type"`
		Content  string `json:"content"`
		Reciever string `json:"reciever"`
		Sender   string `json:"sender"`
		SentAt   string `json:"sent_at"`
		Id   int `json:"id"`
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
				"type":   "status",
				"active": active,
				"name":   nickname,
			})
		}
	}
}
func (c *Clients) GetClients(user string, db *sql.DB) []struct {
	Client string `json:"name"`
	State  string `json:"state"`
	Time   string `json:"time"`
} {
	c.Lock()
	defer c.Unlock()
	res, err := db.Query(`SELECT 
		users.nickname,
		(
			SELECT MAX(createdAt) 
			FROM chat 
			WHERE (sender = ? AND receiver = users.nickname) 
			   OR (sender = users.nickname AND receiver = ?)
		) AS LastSentAt
	FROM users
	WHERE nickname != ?;
	
	`, user, user, user)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	defer res.Close()
	var clients []struct {
		Client string `json:"name"`
		State  string `json:"state"`
		Time   string `json:"time"`
	}
	for res.Next() {
		var client string
		var time string
		res.Scan(&client, &time)
		if c.Map[client] != nil && len(c.Map[client].Conn) > 0 {
			clients = append(clients, struct {
				Client string `json:"name"`
				State  string `json:"state"`
				Time   string `json:"time"`
			}{client, "on", time})
		} else {
			clients = append(clients, struct {
				Client string `json:"name"`
				State  string `json:"state"`
				Time   string `json:"time"`
			}{client, "", time})
		}
	}
	return clients
}
func (c *Clients) GetChat(user1, user2 string, start int, db *sql.DB) []Message {
	var res *sql.Rows
	var err error

	if start > 0 {
		res, err = db.Query(`
		SELECT content, sender, createdAt ,id
		FROM chat 
		WHERE ((sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)) 
		  AND id > ?
		ORDER BY createdAt DESC
		LIMIT 10
	`, user1, user2, user2, user1, start)
	} else {
		res, err = db.Query(`
		SELECT content, sender, createdAt , id
		FROM chat 
		WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) 
		ORDER BY createdAt DESC
		LIMIT 10
	`, user1, user2, user2, user1)
	}
if err!=nil {
	return nil
}
	var messages []Message
	for res.Next() {
		var msg Message
		res.Scan(&msg.Content, &msg.Sender, &msg.SentAt,&msg.Id)
		messages = append(messages, msg)
	}
	return messages
}

func (c *Clients) SendMsg(msg *Message, db *sql.DB) (string, int) {
	_, err := db.Exec(`INSERT INTO chat (sender,receiver,content) VALUES (?,?,?)`, msg.Sender, msg.Reciever, msg.Content)
	if err != nil {
		if err == sql.ErrNoRows {
			return "user doesnt exists", 404
		}
		return "internal server error", 500
	}
	if c.Map[msg.Reciever] != nil {
		c.Lock()
		for conn := range c.Map[msg.Reciever].Conn {
			err := conn.WriteJSON(msg)
			if err != nil {
				fmt.Println(err)
				c.Unlock()
				return "err sending message", 500
			}
		}
		c.Unlock()
	}
	return "", 200
}
func (c *Clients) SendSingnals(msg *Message) string {
	if c.Map[msg.Reciever] == nil {
		return ""
	}
	c.Lock()
	for conn := range c.Map[msg.Reciever].Conn {
		err := conn.WriteJSON(msg)
		if err != nil {
			c.Unlock()
			return "err sending signal"
		}
	}
	c.Unlock()
	return ""
}
