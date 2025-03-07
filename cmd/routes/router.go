package routes

// import (
// 	"database/sql"
// 	chat "forum/backend/chatt"
// 	"forum/backend/handlers"
// 	"forum/backend/midlware"
// 	"net/http"
// )

// func RegisterRoutes(db *sql.DB, clients  chat.Client) {

// 	http.HandleFunc("/frontend", handlers.ServerStatic)
// 	http.HandleFunc("POST /sign-in", func(w http.ResponseWriter, r *http.Request) { handlers.SignInHandler(w, r, db) })
// 	http.HandleFunc("POST /logout", func(w http.ResponseWriter, r *http.Request) { handlers.LogoutHandler(w, r, db) })
// 	http.HandleFunc("POST /signup", func(w http.ResponseWriter, r *http.Request) { handlers.RegisterHandler(w, r, db) })
// 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// 		handlers.Home(w, r, db)
// 	})
// 	http.Handle("/frontend/", http.StripPrefix("/frontend/", http.FileServer(http.Dir("frontend"))))

// 	http.HandleFunc("/chat", midlware.Authorization(
// 		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 			chat.ChatHandler(w, r, db, clients)
// 		}), db))
// 	http.HandleFunc("/addpost", midlware.Authorization(
// 		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 			handlers.AddPost(w, r, db)
// 		}), db))
// 	http.HandleFunc("/fetchpost", midlware.Authorization(
// 		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 			handlers.GetPostsHandler(w, r, db)
// 		}), db))
// 	http.HandleFunc("/addComment", midlware.Authorization(
// 		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 			handlers.AddComments(w, r, db)
// 		}), db))
// 	http.HandleFunc("/fetchcomment", midlware.Authorization(
// 		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 			handlers.GetCommentsHandler(w, r, db)
// 		}), db))
// 	http.HandleFunc("/frontend/css/", handlers.StaticHandler)
// }
