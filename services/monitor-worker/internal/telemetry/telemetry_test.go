package telemetry

import "testing"

func TestRedactURL(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"https://api.example.com/health?token=secret123", "https://api.example.com/health"},
		{"https://user:pass@example.com/path", "https://example.com/path"},
		{"https://example.com/x#fragment", "https://example.com/x"},
		{"http://example.com/a/b?key=abc&sig=def", "http://example.com/a/b"},
		{"", ""},
	}
	for _, c := range cases {
		got := RedactURL(c.in)
		if got != c.want {
			t.Errorf("RedactURL(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestRedactURLNeverLeaksQuery(t *testing.T) {
	got := RedactURL("https://h.example/p?authorization=Bearer%20abc&apikey=zzz")
	if contains(got, "authorization") || contains(got, "apikey") || contains(got, "Bearer") {
		t.Errorf("redacted URL leaked sensitive query: %q", got)
	}
}

func contains(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}

func TestMetricsSnapshot(t *testing.T) {
	m := &Metrics{}
	m.ChecksScheduled.Add(3)
	m.ChecksSucceeded.Add(2)
	m.SSRFBlocks.Add(1)
	snap := m.Snapshot()
	if snap["checks_scheduled"] != 3 || snap["checks_succeeded"] != 2 || snap["ssrf_blocks"] != 1 {
		t.Errorf("unexpected snapshot: %+v", snap)
	}
}
