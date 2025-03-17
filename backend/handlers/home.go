package handlers

import (
	"database/sql"
	"forum/backend/response"
	"net/http"
)

func Home(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != http.MethodGet {
		response.Respond("method not allowed", 405, w)
		return
	}
	http.ServeFile(w, r, "./static/index.html")
}
