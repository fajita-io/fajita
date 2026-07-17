// Package testfixture provides a controlled, deterministic HTTP target for
// monitoring-engine tests and the internal engine lab. It is never a
// general-purpose fetcher and must not be exposed publicly. Automated tests use
// it instead of third-party websites.
package testfixture

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Handler returns the fixture routes.
func Handler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/ok", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("X-Fajita-Fixture", "ok")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("OK"))
	})

	mux.HandleFunc("/status/", func(w http.ResponseWriter, r *http.Request) {
		code, _ := strconv.Atoi(strings.TrimPrefix(r.URL.Path, "/status/"))
		if code < 100 || code > 599 {
			code = 500
		}
		w.WriteHeader(code)
		_, _ = fmt.Fprintf(w, "status %d", code)
	})

	mux.HandleFunc("/delay/", func(w http.ResponseWriter, r *http.Request) {
		ms, _ := strconv.Atoi(strings.TrimPrefix(r.URL.Path, "/delay/"))
		if ms < 0 {
			ms = 0
		}
		if ms > 60000 {
			ms = 60000
		}
		time.Sleep(time.Duration(ms) * time.Millisecond)
		w.WriteHeader(http.StatusOK)
		_, _ = fmt.Fprintf(w, "delayed %dms", ms)
	})

	mux.HandleFunc("/json/healthy", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"healthy","uptime":99.98,"queue":3,"ready":true,"region":"us-east"}`))
	})

	mux.HandleFunc("/json/unhealthy", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"degraded","uptime":41.2,"queue":812,"ready":false}`))
	})

	mux.HandleFunc("/body/contains", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("service operational: all systems nominal"))
	})

	mux.HandleFunc("/body/missing", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("nothing to see here"))
	})

	mux.HandleFunc("/redirect/one", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/ok", http.StatusFound)
	})

	mux.HandleFunc("/redirect/loop", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/redirect/loop", http.StatusFound)
	})

	mux.HandleFunc("/large-response", func(w http.ResponseWriter, _ *http.Request) {
		chunk := strings.Repeat("A", 4096)
		for i := 0; i < 4096; i++ { // ~16 MB, exceeds default 1 MB limit
			_, _ = w.Write([]byte(chunk))
		}
	})

	mux.HandleFunc("/invalid-json", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status": "healthy", oops`))
	})

	mux.HandleFunc("/headers", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("X-Fajita-Region", "us-east")
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("headers set"))
	})

	mux.HandleFunc("/close-connection", func(w http.ResponseWriter, r *http.Request) {
		hj, ok := w.(http.Hijacker)
		if !ok {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		conn, _, err := hj.Hijack()
		if err == nil {
			_ = conn.Close()
		}
	})

	return mux
}
