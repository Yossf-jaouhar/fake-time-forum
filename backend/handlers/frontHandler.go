package handlers

import (
	"net/http"
	"os"
)

func ServerStatic(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		// err
		return
	}
	file, err := os.Stat(r.URL.Path[1:])
	if err != nil || file.IsDir() {
		// err
		return
	}

	http.ServeFile(w, r, r.URL.Path[1:])
}
