package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"forum/backend/errors"

	"github.com/gofrs/uuid/v5"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id        int    `json:"id"`
	Age       int    `json:"age"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Gender    string `json:"gender"`
	Nickname  string `json:"nickname"`
}

type datafromregister struct {
	Username  string      `json:"username"`
	Email     string      `json:"email"`
	Password  string      `json:"password"`
	Age       json.Number `json:"age"`
	FirstName string      `json:"firstName"`
	LastName  string      `json:"lastName"`
	Gender    string      `json:"gender"`
	Nickname  string      `json:"nickname"`
}

func checkIfEmailOrNicknameExists(email, nickname string, db *sql.DB) (bool, bool) {
	var emailExists, nicknameExists bool

	// Check if email already exists
	err := db.QueryRow("SELECT 1 FROM users WHERE email = ?", email).Scan(&emailExists)
	if err != nil && err != sql.ErrNoRows {
		log.Fatal(err)
	}

	// Check if nickname already exists
	err = db.QueryRow("SELECT 1 FROM users WHERE nickname = ?", nickname).Scan(&nicknameExists)
	if err != nil && err != sql.ErrNoRows {
		log.Fatal(err)
	}

	return emailExists, nicknameExists
}

func RegisterHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Parse the incoming JSON data
	var data datafromregister
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println(err)
		errors.SendError("Invalid JSON format", http.StatusBadRequest, w)
		return
	}

	// Check if email or nickname is already taken
	emailExists, nicknameExists := checkIfEmailOrNicknameExists(data.Email, data.Nickname, db)
	if emailExists {
		errors.SendError("Email is already registered", http.StatusConflict, w)
		return
	}
	if nicknameExists {
		errors.SendError("Nickname is already taken", http.StatusConflict, w)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		errors.SendError("Error hashing password", http.StatusInternalServerError, w)
		return
	}

	// Insert the new user into the database
	res, err := db.Exec("INSERT INTO users (age, email, password, fisrtName, lastName, gender, nickname) VALUES (?, ?,?, ?, ?, ?, ?)",
		data.Age, data.Email, hashedPassword, data.FirstName, data.LastName, data.Gender, data.Nickname)
	if err != nil {
		fmt.Println("hi error" , err)
		errors.SendError("Error saving user to database", http.StatusInternalServerError, w)
	
		return
	}

	id, err := res.LastInsertId()
	if err != nil {
		fmt.Println("hi error")
	}

	token, err := GenerateToken(int(id), db)
	if err != nil {
		fmt.Println("erooor")
		return
	}

	cookie := &http.Cookie{Name: "Token", Value: token, MaxAge: 3600, HttpOnly: true}

	http.SetCookie(w, cookie)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "User registered successfully",
	})

}

func GenerateToken(id int, db *sql.DB) (string, error) {
	u2, err := uuid.NewV6()
	if err != nil {
		return "", err
	}
	token := u2.String()
	expirationTime := time.Now().UTC().Add(time.Hour)

	_, err = db.Exec("UPDATE users SET Session = ?, Expired = ? WHERE ID = ?", token, expirationTime, id)
	if err != nil {
		return "", err
	}
	return token , nil
}
