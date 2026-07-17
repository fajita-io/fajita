// Package config loads and validates worker configuration from the environment.
// Startup fails loudly when a critical value is missing or unsafe; there are no
// unsafe defaults for encryption, database credentials, worker identity, or the
// production environment (see docs/engineering/worker-deployment.md).
package config

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"

	contracts "github.com/fajita-io/monitor-contracts"
	"github.com/fajita-io/monitor-worker/internal/crypto"
)

type Config struct {
	DatabaseURL string
	Region      string
	WorkerKey   string
	Version     string
	BuildCommit string
	DeployID    string
	Environment string

	LeaseSeconds     int
	LeaseBatchSize   int
	Concurrency      int
	PollIntervalMS   int
	HeartbeatSeconds int
	ReaperSeconds    int
	EvalDrainSeconds int
	EvalBatchLimit   int
	HTTPPort         int
	LogLevel         string
	UserAgent        string
	MetricsToken     string
	AllowLoopback    bool
	ContractVersion  int
	Keyring          crypto.Keyring
}

// Load reads configuration, validates it, and returns an error listing every
// problem rather than failing on the first.
func Load() (*Config, error) {
	c := &Config{
		DatabaseURL:      os.Getenv("MONITOR_WORKER_DATABASE_URL"),
		Region:           getenv("MONITOR_WORKER_REGION", ""),
		WorkerKey:        getenv("MONITOR_WORKER_KEY", ""),
		Version:          getenv("MONITOR_WORKER_VERSION", "0.0.0-dev"),
		BuildCommit:      getenv("MONITOR_WORKER_COMMIT", "unknown"),
		DeployID:         getenv("MONITOR_WORKER_DEPLOYMENT_ID", ""),
		Environment:      getenv("MONITOR_WORKER_ENV", "development"),
		LeaseSeconds:     getenvInt("MONITOR_WORKER_LEASE_SECONDS", 60),
		LeaseBatchSize:   getenvInt("MONITOR_WORKER_LEASE_BATCH", 20),
		Concurrency:      getenvInt("MONITOR_WORKER_CONCURRENCY", 16),
		PollIntervalMS:   getenvInt("MONITOR_WORKER_POLL_MS", 1000),
		HeartbeatSeconds: getenvInt("MONITOR_WORKER_HEARTBEAT_SECONDS", 15),
		ReaperSeconds:    getenvInt("MONITOR_WORKER_REAPER_SECONDS", 30),
		EvalDrainSeconds: getenvInt("MONITOR_WORKER_EVAL_DRAIN_SECONDS", 5),
		EvalBatchLimit:   getenvInt("MONITOR_WORKER_EVAL_BATCH", 100),
		HTTPPort:         getenvInt("MONITOR_WORKER_HTTP_PORT", 8080),
		LogLevel:         getenv("MONITOR_WORKER_LOG_LEVEL", "info"),
		UserAgent:        getenv("MONITOR_WORKER_USER_AGENT", "Fajita-Monitor/1.0 (+https://fajita.io/monitoring)"),
		MetricsToken:     os.Getenv("MONITOR_WORKER_METRICS_TOKEN"),
		AllowLoopback:    os.Getenv("MONITOR_WORKER_ALLOW_LOOPBACK") == "1",
		ContractVersion:  contracts.ContractVersion,
	}

	ring, keyErr := loadKeyring()
	c.Keyring = ring

	var problems []string
	if c.DatabaseURL == "" {
		problems = append(problems, "MONITOR_WORKER_DATABASE_URL is required")
	}
	if c.Region == "" {
		problems = append(problems, "MONITOR_WORKER_REGION is required")
	}
	if c.WorkerKey == "" {
		problems = append(problems, "MONITOR_WORKER_KEY is required")
	}
	if c.LeaseSeconds < 10 {
		problems = append(problems, "MONITOR_WORKER_LEASE_SECONDS must be >= 10")
	}
	if c.Concurrency < 1 {
		problems = append(problems, "MONITOR_WORKER_CONCURRENCY must be >= 1")
	}
	if c.EvalDrainSeconds < 1 {
		problems = append(problems, "MONITOR_WORKER_EVAL_DRAIN_SECONDS must be >= 1")
	}
	if c.EvalBatchLimit < 1 {
		problems = append(problems, "MONITOR_WORKER_EVAL_BATCH must be >= 1")
	}
	// Loopback is only permissible outside production.
	if c.AllowLoopback && c.Environment == "production" {
		problems = append(problems, "MONITOR_WORKER_ALLOW_LOOPBACK must not be set in production")
	}
	if keyErr != nil {
		problems = append(problems, keyErr.Error())
	}

	if len(problems) > 0 {
		return nil, fmt.Errorf("invalid worker configuration:\n  - %s", strings.Join(problems, "\n  - "))
	}
	return c, nil
}

// loadKeyring parses MONITOR_SECRET_KEYS, a JSON object of version -> base64 key.
// An empty ring is allowed (a worker handling only secret-free monitors); a
// malformed ring is an error.
func loadKeyring() (crypto.Keyring, error) {
	raw := os.Getenv("MONITOR_SECRET_KEYS")
	ring := crypto.Keyring{}
	if strings.TrimSpace(raw) == "" {
		return ring, nil
	}
	var m map[string]string
	if err := json.Unmarshal([]byte(raw), &m); err != nil {
		return ring, fmt.Errorf("MONITOR_SECRET_KEYS is not valid JSON")
	}
	for vStr, b64 := range m {
		v, err := strconv.Atoi(vStr)
		if err != nil {
			return ring, fmt.Errorf("MONITOR_SECRET_KEYS has non-integer version %q", vStr)
		}
		key, err := base64.StdEncoding.DecodeString(b64)
		if err != nil || len(key) != 32 {
			return ring, fmt.Errorf("MONITOR_SECRET_KEYS version %d must be base64 of 32 bytes", v)
		}
		ring[v] = key
	}
	return ring, nil
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func getenvInt(k string, def int) int {
	if v := os.Getenv(k); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}
