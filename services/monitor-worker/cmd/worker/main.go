// Command worker is the Fajita monitoring worker. It registers with the
// database, leases due checks, executes them securely, stores results
// idempotently, exposes health endpoints, and drains gracefully on SIGTERM.
package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fajita-io/monitor-worker/internal/config"
	"github.com/fajita-io/monitor-worker/internal/executor"
	"github.com/fajita-io/monitor-worker/internal/health"
	"github.com/fajita-io/monitor-worker/internal/lease"
	"github.com/fajita-io/monitor-worker/internal/scheduler"
	"github.com/fajita-io/monitor-worker/internal/telemetry"
)

func main() {
	cfg, err := config.Load()
	log := telemetry.NewLogger(os.Getenv("MONITOR_WORKER_LOG_LEVEL"))
	if err != nil {
		log.Error("startup configuration invalid", "error", err.Error())
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	store, err := lease.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Error("database connection failed", "error", err.Error())
		os.Exit(1)
	}
	defer store.Close()

	pingCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	if err := store.Ping(pingCtx); err != nil {
		cancel()
		log.Error("database not reachable at startup", "error", err.Error())
		os.Exit(1)
	}
	cancel()

	exec := &executor.Executor{
		UserAgent:     cfg.UserAgent,
		AllowLoopback: cfg.AllowLoopback,
	}
	metrics := &telemetry.Metrics{}
	sched := scheduler.New(cfg, store, exec, log, metrics)

	hs := &health.Server{
		Ready:        sched.Ready,
		Version:      cfg.Version,
		Region:       cfg.Region,
		Environment:  cfg.Environment,
		Commit:       cfg.BuildCommit,
		Metrics:      metrics,
		MetricsToken: cfg.MetricsToken,
	}
	httpSrv := &http.Server{
		Addr:              ":" + itoa(cfg.HTTPPort),
		Handler:           hs.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
	}
	go func() {
		if err := httpSrv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("health server failed", "error", err.Error())
		}
	}()

	log.Info("worker starting", "version", cfg.Version, "region", cfg.Region, "environment", cfg.Environment)
	if err := sched.Run(ctx); err != nil {
		log.Error("scheduler exited with error", "error", err.Error())
	}

	shutdownCtx, sc := context.WithTimeout(context.Background(), 5*time.Second)
	defer sc()
	_ = httpSrv.Shutdown(shutdownCtx)
	log.Info("worker stopped")
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	buf := [12]byte{}
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
