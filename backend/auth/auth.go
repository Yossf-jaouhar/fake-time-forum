package auth

import (
	"forum/backend/response"
	"net/http"
)

func Auth(w http.ResponseWriter, r *http.Request) {
	response.Respond("yea u can go", 200, w)
}
