package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"forum/backend/errors"
)

type Post struct {
	ID           int      `json:"id"`
	Title        string   `json:"title"`
	Content      string   `json:"content"`
	DateCreation string   `json:"date_creation"`
	UserID       int      `json:"user_id"`
	Publisher    User     `json:"publisher"`
	Categories   []string `json:"categories"`
}

func fetchPosts(page int, db *sql.DB) ([]Post, error) {
	var posts []Post

	// Calculate the offset based on the page number (10 posts per page)
	offset := (page - 1) * 10

	// Query to fetch posts with pagination, publisher (user) details, and categories
	rows, err := db.Query(`
		SELECT 
			p.ID, p.Title, p.Content, p.DateCreation, p.ID_User, 
			u.FirstName, u.LastName, u.Email
		FROM 
			Posts p
		JOIN 
			users u ON p.ID_User = u.ID
		ORDER BY 
			p.DateCreation DESC 
		LIMIT 10 OFFSET ?`, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Iterate over the rows to fetch the posts
	for rows.Next() {
		var post Post
		var firstName, lastName, email string

		// Scan the post data along with publisher details
		if err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.DateCreation, &post.UserID, &firstName, &lastName, &email); err != nil {
			return nil, err
		}

		// Populate the publisher information
		post.Publisher = User{
			Id:        post.UserID,
			FirstName: firstName,
			LastName:  lastName,
			Email:     email,
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
	// Parse page query parameter (default to 1 if not provided)
	page := 1
	pageParam := r.URL.Query().Get("page")
	if pageParam != "" {
		_, err := fmt.Sscanf(pageParam, "%d", &page)
		if err != nil || page < 1 {
			errors.SendError("invalde page", http.StatusBadRequest, w)
			return
		}
	}

	// Fetch posts for the given page
	posts, err := fetchPosts(page, db)
	if err != nil {
		errors.SendError("Error fetching posts", http.StatusInternalServerError, w)
		return
	}

	// Respond with the posts in JSON format
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		errors.SendError("Error encoding posts", http.StatusInternalServerError, w)
		return
	}
}
