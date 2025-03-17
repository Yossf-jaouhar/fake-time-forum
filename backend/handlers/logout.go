package handlers

import (
	"database/sql"
	"forum/backend/response"
	"net/http"
)

// Function to delete the session from the database
func deleteSession(sessionID string, db *sql.DB) error {
	_, err := db.Exec("DELETE FROM sessions WHERE session_id = ?", sessionID)
	return err
}

// Logout handler function
func LogoutHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Get the session ID from the cookie (assuming it's stored as "session_id")
	sessionCookie, err := r.Cookie("session_id")
	if err != nil {
		if err == http.ErrNoCookie {
			response.Respond( "No session found", http.StatusUnauthorized,w)
		} else {
			response.Respond( "Error reading cookie", http.StatusBadRequest,w)
		}
		return
	}

	// Delete the session from the database
	err = deleteSession(sessionCookie.Value, db)
	if err != nil {
		response.Respond( "Error logging out", http.StatusInternalServerError,w)
		return
	}

	// Optionally, clear the session cookie in the response
	http.SetCookie(w, &http.Cookie{
		Name:   "session_id",
		Value:  "",
		Path:   "/",
		MaxAge: -1, // Expire the cookie immediately
	})

	// Respond with a success message
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Successfully logged out"))
}
