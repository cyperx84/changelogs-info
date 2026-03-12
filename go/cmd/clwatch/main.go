package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/anthropics/changelogs-info/go/internal/watcher"
)

const (
	defaultManifestURL = "https://changelogs.info/api/refs/manifest.json"
	defaultInterval    = 6 * time.Hour
	version            = "0.1.0"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "diff":
		runDiff(os.Args[2:])
	case "watch":
		runWatch(os.Args[2:])
	case "status":
		runStatus(os.Args[2:])
	case "help", "--help", "-h":
		printUsage()
	case "version", "--version":
		fmt.Println("clwatch " + version)
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n\n", os.Args[1])
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Print(`clwatch — changelog watcher for changelogs.info

Usage:
  clwatch <command> [flags]

Commands:
  diff      Fetch manifest and show changes since last check
  watch     Run as a daemon, polling for changes on an interval
  status    Show pipeline health and tool status
  version   Print version

Run 'clwatch <command> --help' for command-specific help.
`)
}

// ---------------------------------------------------------------------------
// diff command
// ---------------------------------------------------------------------------

func runDiff(args []string) {
	jsonOutput := false
	manifestURL := manifestURLFromEnv()

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--json":
			jsonOutput = true
		case "--manifest-url":
			if i+1 < len(args) {
				manifestURL = args[i+1]
				i++
			}
		case "--help", "-h":
			fmt.Print(`clwatch diff — fetch manifest and show changes

Usage:
  clwatch diff [--json] [--manifest-url URL]

Flags:
  --json           Output as JSON
  --manifest-url   Override manifest URL (default: CLWATCH_MANIFEST_URL or changelogs.info)
`)
			return
		}
	}

	updates, err := doDiff(context.Background(), manifestURL, jsonOutput)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	_ = updates
}

// ---------------------------------------------------------------------------
// watch command
// ---------------------------------------------------------------------------

func runWatch(args []string) {
	cfg := watcher.Config{
		ManifestURL: manifestURLFromEnv(),
		Interval:    defaultInterval,
	}

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--interval":
			if i+1 < len(args) {
				d, err := watcher.ParseInterval(args[i+1])
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error: %v\n", err)
					os.Exit(1)
				}
				cfg.Interval = d
				i++
			}
		case "--json":
			cfg.JSONOutput = true
		case "--webhook":
			if i+1 < len(args) {
				cfg.WebhookURL = args[i+1]
				i++
			}
		case "--manifest-url":
			if i+1 < len(args) {
				cfg.ManifestURL = args[i+1]
				i++
			}
		case "--help", "-h":
			fmt.Print(`clwatch watch — run as a daemon, polling for changes

Usage:
  clwatch watch [--interval 6h] [--json] [--webhook URL] [--manifest-url URL]

Flags:
  --interval       Poll interval (default: 6h, minimum: 15m)
  --json           Output as JSON
  --webhook        POST webhook URL on changes
  --manifest-url   Override manifest URL
`)
			return
		}
	}

	if err := watcher.Run(cfg, doDiff); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

// ---------------------------------------------------------------------------
// status command
// ---------------------------------------------------------------------------

type StatusResponse struct {
	Schema      string `json:"schema"`
	GeneratedAt string `json:"generated_at"`
	Pipeline    struct {
		LastRunAt    string `json:"last_run_at"`
		Status       string `json:"status"`
		ToolsChecked int    `json:"tools_checked"`
		ToolsUpdated int    `json:"tools_updated"`
		ToolsErrored int    `json:"tools_errored"`
	} `json:"pipeline"`
	Tools map[string]struct {
		Version            string `json:"version"`
		VerificationStatus string `json:"verification_status"`
		LastCheckedAt      string `json:"last_checked_at"`
		Stale              bool   `json:"stale"`
	} `json:"tools"`
}

func runStatus(args []string) {
	jsonOutput := false
	statusURL := statusURLFromEnv()

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--json":
			jsonOutput = true
		case "--status-url":
			if i+1 < len(args) {
				statusURL = args[i+1]
				i++
			}
		case "--help", "-h":
			fmt.Print(`clwatch status — show pipeline health and tool status

Usage:
  clwatch status [--json] [--status-url URL]

Flags:
  --json         Output raw JSON
  --status-url   Override status URL (default: CLWATCH_STATUS_URL or changelogs.info)
`)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, statusURL, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error fetching status: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading response: %v\n", err)
		os.Exit(1)
	}

	if resp.StatusCode != 200 {
		fmt.Fprintf(os.Stderr, "Error: HTTP %d from %s\n", resp.StatusCode, statusURL)
		os.Exit(1)
	}

	if jsonOutput {
		fmt.Println(string(body))
		return
	}

	var status StatusResponse
	if err := json.Unmarshal(body, &status); err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing status: %v\n", err)
		os.Exit(1)
	}

	printStatusTable(status)
}

func printStatusTable(s StatusResponse) {
	pipelineAgo := timeAgo(s.Pipeline.LastRunAt)
	fmt.Println("changelogs.info status")
	fmt.Printf("Pipeline last ran: %s  (%s)\n\n", pipelineAgo, s.Pipeline.Status)

	fmt.Printf("%-14s %-12s %-10s %-7s %s\n", "TOOL", "VERSION", "VERIFIED", "STALE", "LAST CHECKED")
	for name, tool := range s.Tools {
		verified := "✗"
		if tool.VerificationStatus == "verified" {
			verified = "✓"
		}
		stale := "no"
		if tool.Stale {
			stale = "yes"
		}
		ago := timeAgo(tool.LastCheckedAt)
		fmt.Printf("%-14s %-12s %-10s %-7s %s\n", name, tool.Version, verified, stale, ago)
	}
}

func timeAgo(iso string) string {
	t, err := time.Parse(time.RFC3339, iso)
	if err != nil {
		// Try without timezone
		t, err = time.Parse("2006-01-02T15:04:05Z", iso)
		if err != nil {
			return iso
		}
	}

	d := time.Since(t)
	switch {
	case d < time.Minute:
		return "just now"
	case d < time.Hour:
		return fmt.Sprintf("%dm ago", int(d.Minutes()))
	case d < 24*time.Hour:
		return fmt.Sprintf("%dh ago", int(d.Hours()))
	default:
		return fmt.Sprintf("%dd ago", int(d.Hours()/24))
	}
}

// ---------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------

func manifestURLFromEnv() string {
	if u := os.Getenv("CLWATCH_MANIFEST_URL"); u != "" {
		return u
	}
	return defaultManifestURL
}

func statusURLFromEnv() string {
	if u := os.Getenv("CLWATCH_STATUS_URL"); u != "" {
		return u
	}
	// Derive from manifest URL
	return strings.Replace(manifestURLFromEnv(), "/manifest.json", "/status.json", 1)
}

// doDiff fetches the manifest and compares with local cache.
// Returns a list of updates found.
func doDiff(ctx context.Context, manifestURL string, jsonOutput bool) ([]watcher.Update, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, manifestURL, nil)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch manifest: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read manifest: %w", err)
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP %d from %s", resp.StatusCode, manifestURL)
	}

	var manifest watcher.Manifest
	if err := json.Unmarshal(body, &manifest); err != nil {
		return nil, fmt.Errorf("parse manifest: %w", err)
	}

	// Load cached manifest (if any)
	cacheDir, err := os.UserCacheDir()
	if err != nil {
		cacheDir = os.TempDir()
	}
	cachePath := cacheDir + "/clwatch/manifest.json"

	var previous watcher.Manifest
	if data, err := os.ReadFile(cachePath); err == nil {
		_ = json.Unmarshal(data, &previous)
	}

	// Compare
	var updates []watcher.Update
	for name, tool := range manifest.Tools {
		prevTool, existed := previous.Tools[name]
		if !existed {
			updates = append(updates, watcher.Update{
				Tool:            name,
				Status:          "new",
				PreviousVersion: "",
				CurrentVersion:  tool.Version,
				Breaking:        false,
			})
		} else if prevTool.Version != tool.Version {
			updates = append(updates, watcher.Update{
				Tool:            name,
				Status:          "updated",
				PreviousVersion: prevTool.Version,
				CurrentVersion:  tool.Version,
				Breaking:        false,
			})
		}
	}

	// Save current manifest as cache
	if err := os.MkdirAll(cacheDir+"/clwatch", 0o755); err == nil {
		_ = os.WriteFile(cachePath, body, 0o644)
	}

	// Output
	if jsonOutput {
		out, _ := json.MarshalIndent(map[string]interface{}{
			"manifest_url": manifestURL,
			"checked_at":   time.Now().UTC().Format(time.RFC3339),
			"updates":      updates,
		}, "", "  ")
		fmt.Println(string(out))
	} else {
		now := time.Now().UTC().Format("15:04:05Z")
		if len(updates) == 0 {
			fmt.Printf("[%s] No changes detected across %d tools\n", now, len(manifest.Tools))
		} else {
			fmt.Printf("[%s] %d update(s) detected:\n", now, len(updates))
			for _, u := range updates {
				if u.Status == "new" {
					fmt.Printf("  + %-14s %s (new)\n", u.Tool, u.CurrentVersion)
				} else {
					fmt.Printf("  ~ %-14s %s → %s\n", u.Tool, u.PreviousVersion, u.CurrentVersion)
				}
			}
		}
	}

	return updates, nil
}
