package handlers

import (
	"forum/backend/errors"
	"net/http"
)

func Home(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
errors.SendError("method not allowed",http.StatusMethodNotAllowed,w)
		return
	}
	http.ServeFile(w, r, "./frontend/index.html")
}
