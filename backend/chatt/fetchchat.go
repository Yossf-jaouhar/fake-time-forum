package chat

import (
	"database/sql"
	"forum/backend/response"
	"net/http"
	"strconv"
)

func FetchChat(w http.ResponseWriter, r *http.Request, clients *Clients, db *sql.DB) {
	username := r.Context().Value("userName").(string)
	receiver := r.URL.Query().Get("receiver")
	startstr := r.URL.Query().Get("start")
	if startstr == "" || receiver == "" {
		response.Respond("required start and receiver", http.StatusBadRequest, w)
		return
	}
	start, err := strconv.Atoi(startstr)
	if err != nil {
		response.Respond("invalid start", http.StatusBadRequest, w)
		return
	}
	msg := clients.GetChat(username, receiver, start, db)
	response.Respond(msg, http.StatusOK, w)
}
