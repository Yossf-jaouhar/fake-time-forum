package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"forum/backend/response"
)

type post struct {
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	Categories []string `json:"categories"`
}
// AddPost handles the creation of a new post by a user.
func AddPost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != http.MethodPost {
		response.Respond("method not allowed", 405, w)
		return
	}

	ID := r.Context().Value("userId").(int)
	var post post
	err := json.NewDecoder(r.Body).Decode(&post)

	if err != nil {
		response.Respond("only accept json format", http.StatusBadRequest, w)
		return
	}

	if post.Title == "" || post.Content == "" || /*len(post.Categories) == 0 || */ len([]rune(post.Content)) > 1000 || len([]rune(post.Title)) > 50 {
		response.Respond("please fill all the required fields", http.StatusBadRequest, w)
		return
	}

	result, err := db.Exec("INSERT INTO Posts (Title, Content, DateCreation, ID_User) VALUES (?,?,?,?)", post.Title, post.Content, time.Now(), ID)
	if err != nil {
		response.Respond("internal server err", 500, w)
		return
	}

	idPost, _ := result.LastInsertId()
	for _, categoryID := range post.Categories {
		_, err := db.Exec(`INSERT INTO PostCategory (ID_Post, ID_Category)
		SELECT ?, ID FROM Category WHERE Name_Category = ?;`, int(idPost), categoryID)
		if err != nil {
			log.Println(err)
			continue
		}
	}
	response.Respond("goood", 200, w)
}
