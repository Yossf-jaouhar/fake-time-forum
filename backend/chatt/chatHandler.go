package chat

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"forum/backend/response"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

func ChatHandler(w http.ResponseWriter, r *http.Request, db *sql.DB, Clients *Clients) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		response.Respond("internal server error", http.StatusInternalServerError, w)
		return
	}
	username := r.Context().Value("userName").(string)

	if Clients.Map[username] == nil {
		Clients.Map[username] = &Client{
			Conn: make(map[*websocket.Conn]any),
		}
	}
	Clients.Map[username].Conn[conn] = nil
	Clients.ActiveSingal(username, "online")
	defer func() {
		fmt.Println("closing connection")
		delete(Clients.Map[username].Conn, conn)
		if client, ok := Clients.Map[username]; ok && len(client.Conn) == 0 {
			Clients.ActiveSingal(username, "")
			fmt.Println("signal sent")
		}
		conn.Close()
	}()
	otherClients := Clients.GetClients(username, db)
	conn.WriteJSON(map[string]any{"type": "clients", "data": otherClients})
	for {
		msg := &Message{}
		err = conn.ReadJSON(&msg)
		if err != nil {
			errMsg := map[string]string{
				"type": "err",
				"err":  "Failed to parse message. Please try again.",
			}
			if writeErr := conn.WriteJSON(errMsg); writeErr != nil {
				log.Printf("failed to notify client: %v", writeErr)
				break
			}
			continue
		}
		msg.SentAt = time.Now().String()
		msg.Sender = username
		switch msg.Type {
		case "message":
			if err, code := Clients.SendMsg(msg, db); err != "" {
				conn.WriteJSON(map[string]any{"type": "err", "err": err, "code": code})
			}
		case "signal":
			if err := Clients.SendSingnals(msg); err != "" {
				conn.WriteJSON(map[string]any{"type": "err", "err": err, "code": 500})
			}
		case "logout":
			Clients.clear(username)
			break
		default:
			conn.WriteJSON(map[string]any{"type": "err", "err": "invalid message type", "code": http.StatusBadRequest})
		}

	}
}

func (c Clients) clear(user string) {
	for c := range c.Map[user].Conn {
		c.Close()
	}
}