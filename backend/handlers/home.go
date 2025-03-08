package handlers

import (
	"database/sql"
	"net/http"
)

func Home(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method == "post" {
		SignInHandler(w, r, db)
	}
	http.ServeFile(w, r, "./frontend/templete/index.html")
}
