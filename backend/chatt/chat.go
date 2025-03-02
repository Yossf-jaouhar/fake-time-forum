package chat

import (
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
		Conn    []*websocket.Conn
		Message chan *Message
		ID      int `json:"id"`
	}
	Message struct {
		Content  string `json:"content"`
		Reciever int    `json:"r_id"`
	}
)

func NewClients() *Clients {
	return &Clients{
		Map: make(map[string]*Client),
	}
}

func (c *Clients) SendMessage(clientID string, msg *Message) error {
	c.Lock()
	defer c.Unlock()

	client, exists := c.Map[clientID]
	if !exists {
		return fmt.Errorf("client not found")
	}

	client.Message <- msg
	return nil
}

func (c *Clients) RemoveClient(clientID string) {
	c.Lock()
	defer c.Unlock()
	delete(c.Map, clientID)
}
