package chat

import (
	"github.com/gorilla/websocket"
)

type (
	Clients struct {
		Map map[string]*Client
	}
	Client struct {
		Conn    *websocket.Conn
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
		Map:  make(map[string]*Client),
	}
}
