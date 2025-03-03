package chat

import (
	"database/sql"
	"log"
	"net/http"

	"forum/backend/errors"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func ChatHandler(w http.ResponseWriter, r *http.Request, db *sql.DB, Clients *Clients) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	Clients.Map[r.Context().Value("username").(string)].Conn = append(Clients.Map[r.Context().Value("username").(string)].Conn, conn)
	msg := &Message{}
	for {
		err = conn.ReadJSON(msg)
		if err != nil {
			log.Println(err)
			continue
		}
		if err := Clients.SendMsg(msg, db); err != "" {
			errors.SendError(err, http.StatusBadRequest, w)
		}
	}
}
