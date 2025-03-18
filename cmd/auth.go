package main

import "net/http"

func Auth(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("ok"))
}
