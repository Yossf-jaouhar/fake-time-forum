package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
)

func Home(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method == "post" {
		fmt.Println("here")
		SignInHandler(w, r, db)
	}
	// if r.Method != http.MethodGet {
	// 	errors.SendError("method not allowed", http.StatusMethodNotAllowed, w)
	// 	return
	// }
	http.ServeFile(w, r, "./frontend/templete/index.html")
}
