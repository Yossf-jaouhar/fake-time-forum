package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"forum/backend/response"

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
		emailExists = true
	}

	// Check if nickname already exists
	err = db.QueryRow("SELECT 1 FROM users WHERE nickname = ?", nickname).Scan(&nicknameExists)
	if err != nil && err != sql.ErrNoRows {
		nicknameExists = true
	}

	return emailExists, nicknameExists
}

func RegisterHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Parse the incoming JSON data
	var data datafromregister
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		response.Respond("Invalid JSON format", http.StatusBadRequest, w)
		return
	}

	// Check if email or nickname is already taken
	emailExists, nicknameExists := checkIfEmailOrNicknameExists(data.Email, data.Nickname, db)
	if emailExists {
		response.Respond("Email is already registered", http.StatusConflict, w)
		return
	}
	if nicknameExists {
		response.Respond("Nickname is already taken", http.StatusConflict, w)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Respond("Error hashing password", http.StatusInternalServerError, w)
		return
	}

	// Insert the new user into the database
	_, err = db.Exec("INSERT INTO users (age, email, password, fisrtName, lastName, gender, nickname) VALUES (?, ?,?, ?, ?, ?, ?)",
		data.Age, data.Email, hashedPassword, data.FirstName, data.LastName, data.Gender, data.Nickname)
	if err != nil {
		response.Respond("Error saving user to database", http.StatusInternalServerError, w)
		return
	}
	response.Respond("register succesfull", 200, w)
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
	return token, nil
}
