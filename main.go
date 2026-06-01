package main

import (
	"log"
	"net/http"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir("dist")))
	log.Println("Serving production build at http://localhost:7000")
	log.Fatal(http.ListenAndServe(":7000", nil))
}
