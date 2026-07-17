// Command testfixture runs the controlled test-target service used by
// monitoring-engine tests and the internal engine lab. It is not a
// general-purpose fetcher and must never be exposed to the public internet.
package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/fajita-io/monitor-worker/internal/testfixture"
)

func main() {
	addr := os.Getenv("FIXTURE_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8090"
	}
	srv := &http.Server{
		Addr:              addr,
		Handler:           testfixture.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("fajita test fixture listening on %s (internal use only)", addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
