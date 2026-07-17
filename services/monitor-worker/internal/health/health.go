// Package health exposes liveness, readiness, version, and metrics endpoints.
// It never exposes secrets or sensitive configuration. Metrics can be gated
// behind a token.
package health

import (
	"encoding/json"
	"net/http"

	"github.com/fajita-io/monitor-worker/internal/telemetry"
)

type Server struct {
	Ready        func() bool
	Version      string
	Region       string
	Environment  string
	Commit       string
	Metrics      *telemetry.Metrics
	MetricsToken string
}

// Handler returns the HTTP mux for the health endpoints.
func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	mux.HandleFunc("/readyz", func(w http.ResponseWriter, _ *http.Request) {
		if s.Ready != nil && s.Ready() {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("ready"))
			return
		}
		w.WriteHeader(http.StatusServiceUnavailable)
		_, _ = w.Write([]byte("not ready"))
	})

	mux.HandleFunc("/version", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{
			"service":     "fajita-monitor-worker",
			"version":     s.Version,
			"region":      s.Region,
			"environment": s.Environment,
			"commit":      s.Commit,
		})
	})

	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		if s.MetricsToken != "" && r.Header.Get("Authorization") != "Bearer "+s.MetricsToken {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		writeJSON(w, http.StatusOK, s.Metrics.Snapshot())
	})

	return mux
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}
