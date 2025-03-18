package response

import (
	"encoding/json"
	"net/http"
)

func Respond(errMsg any, errCode int, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(errCode)
	json.NewEncoder(w).Encode(errMsg)
}
