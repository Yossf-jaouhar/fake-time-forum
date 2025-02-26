package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

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
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Check if email or nickname is already taken
	emailExists, nicknameExists := checkIfEmailOrNicknameExists(user.Email, user.Nickname, db)
	if emailExists {
		http.Error(w, "Email is already registered", http.StatusConflict)
		return
	}
	if nicknameExists {
		http.Error(w, "Nickname is already taken", http.StatusConflict)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Insert the new user into the database
	_, err = db.Exec("INSERT INTO users (age, email, password, firstName, lastName, nickname) VALUES (?, ?, ?, ?, ?, ?)",
		user.Age, user.Email, hashedPassword, user.FirstName, user.LastName, user.Nickname)
	if err != nil {
		http.Error(w, "Error saving user to database", http.StatusInternalServerError)
		return
	}

	// Send a success response
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}
