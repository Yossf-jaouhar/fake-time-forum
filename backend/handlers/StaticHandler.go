package handlers

import (
	"forum/backend/response"
	"net/http"
	"os"
)

func StaticHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Respond("method not allowed", 405, w)
		return
	}
	file, err := os.Stat(r.URL.Path[1:])
	if err != nil || file.IsDir() {
		response.Respond("not found", 404, w)
		return
	}
	http.ServeFile(w, r, r.URL.Path[1:])
}
