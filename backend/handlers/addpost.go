package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"forum/backend/errors"
)

type post struct {
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	Categories []string `json:categories`
}

// AddPost handles the creation of a new post by a user.
func AddPost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != http.MethodPost {
		return
	}

	ID := r.Context().Value("userId").(int)
	var post post
	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		errors.SendError("only accept json format", http.StatusBadRequest, w)
		return
	}

	if post.Title == "" || post.Content == "" || len(post.Categories) == 0 || len([]rune(post.Content)) > 1000 || len([]rune(post.Title)) > 50 {
		errors.SendError("please fill all the required fields", http.StatusBadRequest, w)
		return
	}

	result, err := db.Exec("INSERT INTO Posts (Title, Content, DateCreation, ID_User) VALUES (?,?,?,?)", post.Title, post.Content, time.Now(), ID)
	if err != nil {
		errors.SendError("internal server err", 500, w)
		return
	}

	idPost, _ := result.LastInsertId()
	for _, categoryID := range post.Categories {
		_, err := db.Exec("INSERT INTO PostCategory (ID_Post, ID_Category) VALUES (?, ?)", int(idPost), categoryID)
		if err != nil {
			log.Println(err)
			return
		}
	}
}
