package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Comment struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	PostID    int       `json:"post_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// Fetch comments for a specific post_id
func fetchComments(postID int, db *sql.DB) ([]Comment, error) {
	var comments []Comment

	// Query to fetch comments for the specified post ID
	rows, err := db.Query("SELECT id, user_id, post_id, content, created_at FROM comments WHERE post_id = ? ORDER BY created_at DESC", postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Iterate through the rows and populate the comments slice
	for rows.Next() {
		var comment Comment
		if err := rows.Scan(&comment.ID, &comment.UserID, &comment.PostID, &comment.Content, &comment.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}

// Handler for fetching comments of a post
func GetCommentsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// For simplicity, we assume the post_id is provided as a query parameter
	postID := r.URL.Query().Get("post_id")
	if postID == "" {
		http.Error(w, "Missing post_id query parameter", http.StatusBadRequest)
		return
	}

	// Convert post_id to integer
	var postIDInt int
	_, err := fmt.Sscanf(postID, "%d", &postIDInt)
	if err != nil {
		http.Error(w, "Invalid post_id format", http.StatusBadRequest)
		return
	}

	// Fetch comments for the given post ID
	comments, err := fetchComments(postIDInt, db)
	if err != nil {
		http.Error(w, "Error fetching comments", http.StatusInternalServerError)
		return
	}

	// Convert the comments to JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(comments); err != nil {
		http.Error(w, "Error encoding comments", http.StatusInternalServerError)
		return
	}
}
