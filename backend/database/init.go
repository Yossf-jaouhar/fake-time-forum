package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func CreateTables() *sql.DB {
	db, err := sql.Open("sqlite3", "backend/database/forum.db")
	if err != nil {
		log.Fatal("error opening database:", err)
	}
	statement, err := os.ReadFile("./backend/database/db.sql")
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.Exec(string(statement))
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Database Connected successfully!")
	return db
}
