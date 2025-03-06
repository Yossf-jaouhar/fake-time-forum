package handlers

import (
	"database/sql"
	"net/http"

	"forum/backend/errors"
)

func Home(w http.ResponseWriter, r *http.Request , db *sql.DB) {
	if r.Method != http.MethodGet {
		errors.SendError("method not allowed", http.StatusMethodNotAllowed, w)
		return
	}
	http.ServeFile(w, r, "./frontend/templete/index.html")
}
