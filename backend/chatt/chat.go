package chat

import (
	"database/sql"
	"sync"

	"github.com/gorilla/websocket"
)

type (
	Clients struct {
		Map map[string]*Client
		sync.RWMutex
	}
	Client struct {
		Conn []*websocket.Conn
	}
	Message struct {
		Content  string `json:"content"`
		Reciever string `json:"reciever"`
		Sender   string `json:"sender"`
		SentAt   string `json:"sent_at"`
	}
)

func NewClients(db *sql.DB) *Clients {
	c := &Clients{
		Map: make(map[string]*Client),
	}
	res, _ := db.Query(`SELECT nickname FROM users`)
	for res.Next() {
		u := ""
		res.Scan(&u)
		c.Map[u] = &Client{
			Conn: []*websocket.Conn{},
		}
	}
	return c
}

func (c *Clients) SendMsg(msg *Message, db *sql.DB) string {
	if c.Map[msg.Reciever] == nil || c.Map[msg.Sender] == nil {
		return "user doesnt exists"
	}
	for _, conn := range c.Map[msg.Reciever].Conn {
		conn.WriteJSON(msg)
	}
	r_id, s_id := 0, 0
	db.QueryRow(`SELECT id FROM users WHERE nickname = ?`, msg.Sender).Scan(s_id)
	db.QueryRow(`SELECT id FROM users WHERE nickname = ?`, msg.Reciever).Scan(r_id)
	if r_id == 0 || s_id == 0 {
		return "user doesnt exists"
	}
	db.Exec(`INSERT INTO chat (sender,receiver,content) VALUE (?,?,?)`, s_id, r_id, msg.Content)
	return ""
}

func (c *Clients) RemoveClient(clientID string) {
	c.Lock()
	defer c.Unlock()
	delete(c.Map, clientID)
}
