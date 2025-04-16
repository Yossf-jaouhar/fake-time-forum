package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	chat "forum/backend/chatt"
	"forum/backend/database"
	"forum/backend/handlers"
	"forum/backend/midlware"
	"forum/backend/response"
)

func main() {
	// Initialize database and chat clients
	// Initialize database and chat clients
	db := database.CreateTables()
	clients := chat.NewClients(db)

	// Create a new mux for better routing control
	mux := http.NewServeMux()

	// Serve static files
	fs := http.FileServer(http.Dir("static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))
	mux.HandleFunc("/auth", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			Auth(w, r)
		}), db))
	// Auth routes - using proper method checking
	mux.HandleFunc("/sign-in", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			response.Respond("method not allowed", 405, w)
			return
		}
		handlers.SignInHandler(w, r, db)
	})

	mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			response.Respond("method not allowed", 405, w)
			return
		}
		handlers.LogoutHandler(w, r, db)
	})

	mux.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			response.Respond("method not 1", 405, w)
			return
		}
		handlers.RegisterHandler(w, r, db)
	})

	// Home route
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.Redirect(w, r, "/", 404)
			return
		}
		handlers.Home(w, r, db)
	})
	mux.HandleFunc("/fetchChat", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			chat.FetchChat(w, r, clients, db)
		}), db))
	mux.HandleFunc("/fetchComment", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			chat.FetchChat(w, r, clients, db)
		}), db))
	// Protected routes with authorization
	mux.HandleFunc("/chat", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			chat.ChatHandler(w, r, db, clients)
		}), db))

	mux.HandleFunc("/addpost", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.AddPost(w, r, db)
		}), db))

	mux.HandleFunc("/fetchpost", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.GetPostsHandler(w, r, db)
		}), db))

	mux.HandleFunc("/addComment", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.AddComments(w, r, db)
		}), db))
	mux.HandleFunc("/fetchcomment", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.GetCommentsHandler(w, r, db)
		}), db))
	mux.HandleFunc("/categories", midlware.Authorization(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.Getcategories(w, r, db)
		}), db))
	// deprecated

	// Create server with timeouts
	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	// Start server in a goroutine
	go func() {
		fmt.Printf("Server running on http://localhost%s\n", server.Addr)
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("Server error: %v\n", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown error: %v\n", err)
	}
	log.Println("Server gracefully stopped")
}
