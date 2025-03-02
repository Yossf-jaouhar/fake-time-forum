package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"forum/backend/errors"

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
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		errors.SendError("Invalid JSON format", http.StatusBadRequest, w)
		return
	}

	// Check if email or nickname is already taken
	emailExists, nicknameExists := checkIfEmailOrNicknameExists(user.Email, user.Nickname, db)
	if emailExists {
		errors.SendError("Email is already registered", http.StatusConflict, w)
		return
	}
	if nicknameExists {
		errors.SendError("Nickname is already taken", http.StatusConflict, w)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		errors.SendError("Error hashing password", http.StatusInternalServerError, w)
		return
	}

	// Insert the new user into the database
	_, err = db.Exec("INSERT INTO users (age, email, password, firstName, lastName, nickname) VALUES (?, ?, ?, ?, ?, ?)",
		user.Age, user.Email, hashedPassword, user.FirstName, user.LastName, user.Nickname)
	if err != nil {
		errors.SendError("Error saving user to database", http.StatusInternalServerError, w)
		return
	}

	// Send a success response
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}
