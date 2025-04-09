package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"forum/backend/response"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func getUserBylogin(login string, db *sql.DB) (*User, error) {
	var user User
	// Check if the provided value is an email or nickname and query accordingly
	row := db.QueryRow("SELECT id, age, email, password, fisrtName, lastName, nickname,gender FROM users WHERE email = ? OR nickname = ?", login, login)

	err := row.Scan(&user.Id, &user.Age, &user.Email, &user.Password, &user.FirstName, &user.LastName, &user.Nickname, &user.Gender)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	return &user, nil
}

func SignInHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Parse the incoming JSON data
	if r.Method != http.MethodPost {
		response.Respond("method not allowed", 405, w)
		return
	}
	var loginDetails struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&loginDetails)
	if err != nil {
		response.Respond("Invalid JSON format", http.StatusBadRequest, w)
		return
	}
	// Get the user by email or nickname
	user, err := getUserBylogin(loginDetails.Login, db)
	if err != nil {
		fmt.Println(err,1)
		response.Respond("Invalid credentials", http.StatusUnauthorized, w)
		return
	}

	// Compare the provided password with the stored hashed password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginDetails.Password))
	if err != nil {
		fmt.Println(err,2)
		response.Respond("Invalid credentials", http.StatusUnauthorized, w)
		return
	}
	token, err := GenerateToken(int(user.Id), db)
	if err != nil {
		response.Respond("internal server error", 500, w)
		return
	}

	cookie := &http.Cookie{Name: "Token", Value: token, MaxAge: 3600, HttpOnly: true, SameSite: http.SameSiteStrictMode}

	http.SetCookie(w, cookie)
	// If login is successful, return a success response
	response.Respond("login succesfull", 200, w)
}
