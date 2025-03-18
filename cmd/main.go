package main

import (
	"fmt"
	"log"
	"net/http"

	"forum/backend/auth"
	chat "forum/backend/chatt"
	"forum/backend/database"
	"forum/backend/handlers"
	"forum/backend/midlware"
)

func main() {
	db := database.CreateTables()
	clients := chat.NewClients(db)
	http.HandleFunc("/static", handlers.ServerStatic)
	http.HandleFunc("/sign-in", func(w http.ResponseWriter, r *http.Request) { handlers.SignInHandler(w, r, db) })
	http.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) { handlers.LogoutHandler(w, r, db) })
	http.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) { handlers.RegisterHandler(w, r, db) })
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		handlers.Home(w, r, db)
	})
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/auth", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			auth.Auth(w, r)
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
	fmt.Println("your serve on : http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
