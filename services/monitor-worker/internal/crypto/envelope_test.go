package crypto

import (
	"bytes"
	"encoding/base64"
	"strings"
	"testing"
)

func testRing() Keyring {
	k1 := bytes.Repeat([]byte{0x11}, 32)
	k2 := bytes.Repeat([]byte{0x22}, 32)
	return Keyring{1: k1, 2: k2}
}

func TestEncryptDecryptRoundTrip(t *testing.T) {
	ring := testRing()
	secret := []byte("Bearer sk-live-abcdef1234567890")
	env, err := Encrypt(ring, 2, secret)
	if err != nil {
		t.Fatalf("encrypt: %v", err)
	}
	if !strings.HasPrefix(env, "v2:") {
		t.Errorf("expected v2 prefix, got %q", env)
	}
	out, err := Decrypt(ring, env)
	if err != nil {
		t.Fatalf("decrypt: %v", err)
	}
	if !bytes.Equal(out, secret) {
		t.Errorf("round trip mismatch: %q", out)
	}
}

func TestEncryptUsesFreshNonce(t *testing.T) {
	ring := testRing()
	a, _ := Encrypt(ring, 1, []byte("same"))
	b, _ := Encrypt(ring, 1, []byte("same"))
	if a == b {
		t.Error("two encryptions of the same plaintext must differ (nonce reuse)")
	}
}

func TestDecryptTamperFailsClosed(t *testing.T) {
	ring := testRing()
	env, _ := Encrypt(ring, 1, []byte("secret"))
	sep := strings.IndexByte(env, ':')
	raw, _ := base64.StdEncoding.DecodeString(env[sep+1:])
	raw[len(raw)-1] ^= 0xFF // flip a tag byte
	tampered := env[:sep+1] + base64.StdEncoding.EncodeToString(raw)
	if _, err := Decrypt(ring, tampered); err == nil {
		t.Error("tampered ciphertext must fail authentication")
	}
}

func TestDecryptUnknownVersion(t *testing.T) {
	ring := testRing()
	env, _ := Encrypt(ring, 1, []byte("secret"))
	// Ring without version 1.
	partial := Keyring{2: ring[2]}
	if _, err := Decrypt(partial, env); err != ErrNoKey {
		t.Errorf("expected ErrNoKey, got %v", err)
	}
}

func TestDecryptMalformed(t *testing.T) {
	ring := testRing()
	bad := []string{"", "x1:abc", "v:abc", "vX:abc", "v1:not base64!!!", "v1:", "v1:AAAA"}
	for _, b := range bad {
		if _, err := Decrypt(ring, b); err == nil {
			t.Errorf("expected error for malformed envelope %q", b)
		}
	}
}

func TestEncryptWrongKeySize(t *testing.T) {
	ring := Keyring{1: []byte("too-short")}
	if _, err := Encrypt(ring, 1, []byte("x")); err == nil {
		t.Error("expected error for non-32-byte key")
	}
}

// TestDecryptTypeScriptEnvelope proves cross-language interop: this envelope was
// produced by the web application (src/lib/monitoring/secret-crypto.ts) using a
// 32-byte key of all 0x11. The worker must decrypt it identically.
func TestDecryptTypeScriptEnvelope(t *testing.T) {
	ring := Keyring{1: bytes.Repeat([]byte{0x11}, 32)}
	const envelope = "v1:0r+NJAgeVLc4rMlsaf/PBt3ZvtDQ1+qYmSQFNBnI4Utu4X7ZpUcb5z8FZmjWExZn"
	out, err := Decrypt(ring, envelope)
	if err != nil {
		t.Fatalf("failed to decrypt TS-produced envelope: %v", err)
	}
	if string(out) != "interop-secret-value" {
		t.Errorf("interop mismatch: got %q", out)
	}
}
