package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"forum/backend/response"
)

type Comment struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	PostID    int       `json:"post_id"`
	Usern     string    `json:"user"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// Fetch comments for a specific post_id
func fetchComments(postID, start int, db *sql.DB) ([]Comment, error) {
	var comments []Comment
	query := "SELECT id,ID_User, content, DateCreation FROM Comment WHERE ID_post = ? ORDER BY DateCreation DESC"
	if start > 0 {
		query += fmt.Sprintf(" AND id < %d", start)
	}
	query += " LIMIT 10"
	// Query to fetch comments for the specified post ID
	rows, err := db.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	// Iterate through the rows and populate the comments slice
	for rows.Next() {
		var comment Comment
		if err := rows.Scan(&comment.ID, &comment.UserID, &comment.Content, &comment.CreatedAt); err != nil {
			return nil, err
		}
		uq := `SELECT nickname FROM users WHERE ID = ?`
		db.QueryRow(uq, comment.UserID).Scan(&comment.Usern)
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
	postID := r.URL.Query().Get("p_id")
	start := 0
	startInt := r.URL.Query().Get("start")
	if startInt != "" {
		_, err := fmt.Sscanf(startInt, "%d", &start)
		if err != nil || start < 0 {
			response.Respond("invalde query", http.StatusBadRequest, w)
			return
		}
	}
	if postID == "" {
		response.Respond("post id missing", http.StatusBadRequest, w)
		return
	}

	// Convert post_id to integer
	var postIDInt int
	_, err := fmt.Sscanf(postID, "%d", &postIDInt)
	if err != nil {
		response.Respond("post id invalid", http.StatusBadRequest, w)
		return
	}

	// Fetch comments for the given post ID
	comments, err := fetchComments(postIDInt, start, db)
	if err != nil {
		response.Respond("error fetching comments", http.StatusInternalServerError, w)
		return
	}
	// Convert the comments to JSON
	response.Respond(comments, http.StatusOK, w)
}
