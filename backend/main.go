package main

import (
	"net/http"

	chat "forum/backend/chatt"
	"forum/backend/database"
	"forum/backend/handlers"
	"forum/backend/midlware"
)

func main() {
	db := database.CreateTables()
	clients := chat.NewClients()
	http.HandleFunc("/frontend", handlers.ServerStatic)
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) { handlers.SignInHandler(w, r, db) })
	http.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) { handlers.LogoutHandler(w, r, db) })
	http.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) { handlers.RegisterHandler(w, r, db) })
	http.HandleFunc("/", midlware.Authorization(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlers.Home(w, r)
	}), db))
	http.HandleFunc("/chat", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			chat.ChatHandler(w, r, db, clients)
		}), db))
	http.HandleFunc("/addpost", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.AddPost(w, r, db)
		}), db))
	http.HandleFunc("/fetchpost", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.GetPostsHandler(w, r, db)
		}), db))
	http.HandleFunc("/addComment", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.AddComments(w, r, db)
		}), db))
	http.HandleFunc("/fetchcomment", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.GetCommentsHandler(w, r, db)
		}), db))
	http.ListenAndServe(":8080", nil)
}
