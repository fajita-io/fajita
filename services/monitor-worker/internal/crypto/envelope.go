// Package crypto implements authenticated envelope encryption for monitor
// secrets using AES-256-GCM. The wire format is shared with the web application
// (src/lib/monitoring/secret-crypto.ts) so the app encrypts and the worker
// decrypts the same bytes.
//
// Format:  v<keyVersion>:<base64std( nonce(12) || ciphertext||tag )>
//
// No homegrown algorithm is used; only the Go standard library's AES-GCM. Keys
// are 32 raw bytes provided per version through configuration, supporting
// rotation without re-encrypting historical rows (see
// docs/security/monitor-secret-encryption.md).
package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"strings"
)

const nonceSize = 12

// Keyring maps a key version to its 32-byte AES-256 key.
type Keyring map[int][]byte

// ErrNoKey indicates the payload references a key version not in the ring.
var ErrNoKey = errors.New("crypto: no key for version")

func gcmFor(key []byte) (cipher.AEAD, error) {
	if len(key) != 32 {
		return nil, fmt.Errorf("crypto: key must be 32 bytes, got %d", len(key))
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	return cipher.NewGCM(block)
}

// Encrypt seals plaintext with the given key version and returns the envelope
// string. Present mainly for tests and tooling; the app is the normal producer.
func Encrypt(ring Keyring, version int, plaintext []byte) (string, error) {
	key, ok := ring[version]
	if !ok {
		return "", ErrNoKey
	}
	aead, err := gcmFor(key)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, nonceSize)
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}
	sealed := aead.Seal(nil, nonce, plaintext, nil)
	packed := append(append([]byte{}, nonce...), sealed...)
	return "v" + strconv.Itoa(version) + ":" + base64.StdEncoding.EncodeToString(packed), nil
}

// Decrypt opens an envelope string, selecting the key by version. It fails
// closed on any tampering (GCM authentication) or malformed input.
func Decrypt(ring Keyring, envelope string) ([]byte, error) {
	if !strings.HasPrefix(envelope, "v") {
		return nil, errors.New("crypto: malformed envelope prefix")
	}
	sep := strings.IndexByte(envelope, ':')
	if sep < 2 {
		return nil, errors.New("crypto: malformed envelope")
	}
	version, err := strconv.Atoi(envelope[1:sep])
	if err != nil {
		return nil, errors.New("crypto: bad key version")
	}
	key, ok := ring[version]
	if !ok {
		return nil, ErrNoKey
	}
	packed, err := base64.StdEncoding.DecodeString(envelope[sep+1:])
	if err != nil {
		return nil, errors.New("crypto: bad base64")
	}
	if len(packed) < nonceSize+16 {
		return nil, errors.New("crypto: ciphertext too short")
	}
	aead, err := gcmFor(key)
	if err != nil {
		return nil, err
	}
	nonce := packed[:nonceSize]
	ct := packed[nonceSize:]
	plaintext, err := aead.Open(nil, nonce, ct, nil)
	if err != nil {
		return nil, errors.New("crypto: authentication failed")
	}
	return plaintext, nil
}
