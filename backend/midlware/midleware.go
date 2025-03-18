package midlware

import (
	"context"
	"database/sql"
	"forum/backend/response"
	"net/http"
	"time"
)

// Authorization checks if the user is logged in by verifying the session token and expiration time
// from the database. If valid, it attaches user details to the request context and proceeds to the next handler.
func Authorization(next http.Handler, db *sql.DB) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("Token")
		if err != nil {
			response.Respond("unauthorized", 403, w)
			return
		}
		var userId int
		var userName string
		var expired time.Time
		db.QueryRow("SELECT ID, nickname ,Expired FROM Users WHERE Session=?", cookie.Value).Scan(&userId, &userName, &expired)
		if userId == 0 {
			response.Respond("unauthorized", 403, w)
			return
		}

		if time.Now().UTC().After(expired.UTC()) {
			db.Exec("UPDATE users set Session=? WHERE ID=?", "", userId)
			response.Respond("unauthorized", 403, w)
			return
		}
		ctx := context.WithValue(r.Context(), "userId", userId)
		ctx = context.WithValue(ctx, "userName", userName)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
