package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"forum/backend/response"
)

type Post struct {
	ID           int      `json:"id"`
	Title        string   `json:"title"`
	Content      string   `json:"content"`
	DateCreation string   `json:"date_creation"`
	Publisher    string   `json:"publisher"`
	Categories   []string `json:"categories"`
}

func fetchPosts(start int, db *sql.DB) ([]Post, error) {
	var posts []Post
	// Calculate the offset based on the start number (10 posts per start)	// Query to fetch posts with pagination, publisher (user) details, and categories
	query := `
		SELECT 
			p.ID, p.Title, p.Content, p.DateCreation, 
			u.nickname
		FROM 
			Posts p
		JOIN 
			users u ON p.ID_User = u.ID
		ORDER BY 
			p.DateCreation DESC `
	if start > 0 {
		query += fmt.Sprintf(" where p.ID < %d", start)
	}
	query += " LIMIT 10"
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	// Iterate over the rows to fetch the posts
	for rows.Next() {
		var post Post
		// Scan the post data along with publisher details
		if err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.DateCreation, &post.Publisher); err != nil {
			return nil, err
		}
		// Now fetch the categories for the current post
		categories, err := fetchCategoriesForPost(post.ID, db)
		if err != nil {
			return nil, err
		}
		post.Categories = categories
		// Append the post to the posts slice
		posts = append(posts, post)
	}
	// Check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return posts, nil
}

// Fetch categories for a given post
func fetchCategoriesForPost(postID int, db *sql.DB) ([]string, error) {
	var categories []string
	// Query to fetch categories associated with a specific post
	rows, err := db.Query(`
		SELECT c.Name_Category 
		FROM Category c
		JOIN PostCategory pc ON c.ID = pc.ID_Category
		WHERE pc.ID_Post = ?`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	// Iterate over the rows to fetch category names
	for rows.Next() {
		var categoryName string
		if err := rows.Scan(&categoryName); err != nil {
			return nil, err
		}
		categories = append(categories, categoryName)
	}
	// Check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return categories, nil
}

// Handler for fetching posts
func GetPostsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != http.MethodGet {
		response.Respond("method not allowed", 405, w)
		return
	}
	// Parse start query parameter (default to 1 if not provided)
	start := 0
	lastPost := r.URL.Query().Get("lastPost")
	if lastPost != "" {
		_, err := fmt.Sscanf(lastPost, "%d", &start)
		if err != nil || start < 1 {
			response.Respond("invalde query", http.StatusBadRequest, w)
			return
		}
	}
	// Fetch posts for the given start
	posts, err := fetchPosts(start, db)
	if err != nil {
		response.Respond("Error fetching posts", http.StatusInternalServerError, w)
		return
	}
	// Respond with the posts in JSON format
	response.Respond(posts, http.StatusOK, w)
}
