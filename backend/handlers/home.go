package handlers

import "net/http"

func Home(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		// err
		return
	}
	http.ServeFile(w, r, "./frontend/index.html")
}
