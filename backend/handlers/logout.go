package handlers

import (
	"database/sql"
	"forum/backend/response"
	"net/http"
)

// Function to delete the session from the database
func deleteSession(token string, db *sql.DB) error {
	_, err := db.Exec("UPDATE users SET Session = NULL, Expired = NULL WHERE Session = ?", token)
	return err
}

// Logout handler function
func LogoutHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != http.MethodPost {
		response.Respond("method not allowed", http.StatusMethodNotAllowed, w)
		return
	}

	// Get the token from the cookie
	tokenCookie, err := r.Cookie("Token")
	if err != nil {
		if err == http.ErrNoCookie {
			response.Respond("No session found", http.StatusUnauthorized, w)
		} else {
			response.Respond("Error reading cookie", http.StatusBadRequest, w)
		}
		return
	}

	// Delete the session from the database
	err = deleteSession(tokenCookie.Value, db)
	if err != nil {
		response.Respond("Error logging out", http.StatusInternalServerError, w)
		return
	}

	// Clear the token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "Token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	})

	// Respond with a success message
	response.Respond("Successfully logged out", http.StatusOK, w)
}
