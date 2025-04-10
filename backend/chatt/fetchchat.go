package chat

import (
	"database/sql"
	"fmt"
	"forum/backend/response"
	"net/http"
	"strconv"
)

func FetchChat(w http.ResponseWriter, r *http.Request, clients *Clients, db *sql.DB) {
	username := r.Context().Value("userName").(string)
	with := r.URL.Query().Get("with")
	startstr := r.URL.Query().Get("start")
	if startstr == "" || with == "" {
		response.Respond("required start and with", http.StatusBadRequest, w)
		return
	}
	start, err := strconv.Atoi(startstr)
	if err != nil {
		response.Respond("invalid start", http.StatusBadRequest, w)
		return
	}
	fmt.Println(start)
	msg := clients.GetChat(username, with, start, db)
	response.Respond(msg, http.StatusOK, w)
}
