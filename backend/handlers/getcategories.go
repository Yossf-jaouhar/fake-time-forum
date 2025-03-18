package handlers

import (
	"database/sql"
	"forum/backend/response"
	"net/http"
)

func Getcategories(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	cat := []string{}
	rows, err := db.Query(`SELECT Name_Category FROM Catrgory`)
	if err != nil {
		response.Respond("internal server error", http.StatusInternalServerError, w)
		return
	}
	for rows.Next() {
		var catname string
		err = rows.Scan(&catname)
		if err != nil {
			response.Respond("internal server error", http.StatusInternalServerError, w)
			return
		}
		cat = append(cat, catname)
	}
	response.Respond(cat, http.StatusOK, w)
}
