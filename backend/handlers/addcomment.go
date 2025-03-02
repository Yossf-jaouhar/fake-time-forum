package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"forum/backend/errors"
)

type comment struct {
	Comment string `json:"comment"`
	PostId  int    `json:"postid"`
}

// AddComments handles adding a comment to a post.
func AddComments(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != http.MethodPost {
		return
	}

	var comment comment
	userID := r.Context().Value("userId").(int)
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		errors.SendError("only accept json format", http.StatusBadRequest, w)
		return
	}
	if comment.Comment == "" || len([]rune(comment.Comment)) > 500 || !CheckIdExists(db, comment.PostId, "Posts") {
		errors.SendError("please fill all the required fields", http.StatusBadRequest, w)
		return
	}

	err = AddCommentsInDB(db, userID, comment.PostId, comment.Comment)
	if err != nil {
	errors.SendError("internal server err", 500, w)
	return
	}
}

// AddCommentsInDB inserts a new comment into the database associated with a specific user and post.
func AddCommentsInDB(db *sql.DB, userID int, postID int, comment string) error {
	query := `
	INSERT INTO comment VALUES (?,?,?,?,?)
	`
	_, err := db.Exec(query, nil, comment, time.Now(), userID, postID)
	if err != nil {
		return err
	}
	return nil
}

func CheckIdExists(db *sql.DB, postID int, table string) bool {
	query := `
	  SELECT ID FROM ` + table + `
	  WHERE ID = ?
	`
	var id int
	db.QueryRow(query, postID).Scan(&id)

	return id != 0
}
