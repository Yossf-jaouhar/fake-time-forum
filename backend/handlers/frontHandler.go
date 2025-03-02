package handlers

import (
	"net/http"
	"os"

	"forum/backend/errors"
)

func ServerStatic(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		errors.SendError("only get alloewd", http.StatusMethodNotAllowed, w)
		return
	}
	file, err := os.Stat(r.URL.Path[1:])
	if err != nil || file.IsDir() {
		errors.SendError("not found", 404, w)
		return
	}

	http.ServeFile(w, r, r.URL.Path[1:])
}
