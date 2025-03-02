package errors

import (
	"encoding/json"
	"net/http"
)

func SendError(errMsg string, errCode int, w http.ResponseWriter) {
	w.WriteHeader(errCode)
	json.NewEncoder(w).Encode(errMsg)
}
