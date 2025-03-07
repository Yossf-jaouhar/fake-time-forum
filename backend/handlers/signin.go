package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"forum/backend/errors"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func getUserByEmailOrNickname(emailOrNickname string, db *sql.DB) (*User, error) {
	var user User
	// Check if the provided value is an email or nickname and query accordingly
	row := db.QueryRow("SELECT id, age, email, password, firstName, lastName, nickname,gender FROM users WHERE email = ? OR nickname = ?", emailOrNickname, emailOrNickname)

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
	fmt.Println("hhhhhhhhhh")
	var loginDetails struct {
		EmailOrNickname string `json:"emailOrNickname"`
		Password        string `json:"password"`
	}

	
	err := json.NewDecoder(r.Body).Decode(&loginDetails)
	if err != nil {
		errors.SendError( "Invalid JSON format", http.StatusBadRequest,w)
		return
	}


	// Get the user by email or nickname
	user, err := getUserByEmailOrNickname(loginDetails.EmailOrNickname, db)
	if err != nil {
		fmt.Println("hhh is error")
		errors.SendError( "Invalid credentials", http.StatusUnauthorized,w)
		return
	}

	// Compare the provided password with the stored hashed password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginDetails.Password))
	if err != nil {
		errors.SendError( "Invalid credentials", http.StatusUnauthorized,w)
		return
	}

	// If login is successful, return a success response
	// (In a real-world scenario, you'd issue a session token or JWT here)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Login successful"))
}
