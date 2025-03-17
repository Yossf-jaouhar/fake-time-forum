package handlers

import (
	"net/http"
	"os"

	"forum/backend/response"
)

func ServerStatic(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		response.Respond("only get alloewd", http.StatusMethodNotAllowed, w)
		return
	}
	file, err := os.Stat(r.URL.Path[1:])
	if err != nil || file.IsDir() {
		response.Respond("not found", 404, w)
		return
	}

	http.ServeFile(w, r, r.URL.Path[1:])
}
