package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
	"unicode"

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
	Email     string      `json:"email"`
	Password  string      `json:"password"`
	Age       json.Number `json:"age"`
	FirstName string      `json:"firstName"`
	LastName  string      `json:"lastName"`
	Gender    string      `json:"gender"`
	Nickname  string      `json:"nickname"`
}

func valid(d datafromregister) bool {
	d.Email = strings.TrimSpace(d.Email)
	d.Password = strings.TrimSpace(d.Password)
	d.FirstName = strings.TrimSpace(d.FirstName)
	d.LastName = strings.TrimSpace(d.LastName)
	d.Gender = strings.ToLower(strings.TrimSpace(d.Gender))
	d.Nickname = strings.TrimSpace(d.Nickname)
	
	if  d.Email == "" || d.Password == "" ||
		d.FirstName == "" || d.LastName == "" || d.Gender == "" {
		return false
	}
	if !strings.Contains(d.Email, "@") || !strings.Contains(d.Email, ".") {
		return false
	}
	if len(d.Password) < 6 {
		return false
	}
	age, err := d.Age.Int64()
	fmt.Println(err)
	if age < 8 || age > 100 || err != nil {
		return false
	}
	if len(d.Nickname) < 3 {
		return false
	}
	hasLetter := false
	for _, r := range d.Nickname {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) {
			return false
		}
		if unicode.IsLetter(r) {
			hasLetter = true
		}
	}
	if !hasLetter {
		return false
	}
	return d.Gender == "male" || d.Gender == "female"
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
		fmt.Println(err)
		response.Respond("Invalid JSON format", http.StatusBadRequest, w)
		return
	}
	if !valid(data) {
		response.Respond("invalid data", http.StatusBadRequest, w)
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
