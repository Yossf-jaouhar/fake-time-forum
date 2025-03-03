package handlers

import (
	"net/http"

	"forum/backend/errors"
)

func Home(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		errors.SendError("method not allowed", http.StatusMethodNotAllowed, w)
		return
	}
	http.ServeFile(w, r, "./frontend/index.html")
}
