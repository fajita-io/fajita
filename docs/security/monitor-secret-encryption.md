# Monitor secret encryption

Phase 4. Monitor credentials (authorization headers, API keys, bearer tokens,
basic auth, custom headers) are encrypted with authenticated envelope
encryption. No homegrown algorithm is used.

## Algorithm

AES-256-GCM. Implemented twice, verified to interoperate:

- Web application: `src/lib/monitoring/secret-crypto.ts`
- Worker: `services/monitor-worker/internal/crypto/envelope.go`

## Wire format

```text
v<keyVersion>:<base64(nonce || ciphertext || tag)>
```

`keyVersion` selects the key from the ring. The 12-byte GCM nonce is random per
encryption. The GCM tag authenticates the ciphertext; any tampering fails
decryption.

## Keyring

- App reads `MONITOR_SECRET_KEYRING`: comma-separated `version:base64key`
  entries. The highest version is the active encryption key; older versions
  remain for decryption during rotation.
- Worker reads `MONITOR_SECRET_KEYS`: a JSON object `{"1":"base64-32-byte-key"}`.
  Both forms decode to the same 32-byte keys.
- Keys are 32 raw bytes, base64-encoded. Server-only; never shipped to the
  browser (`monitorKeyring()` throws if called with `window` defined).

## Rotation

Add a new higher version to the ring. New writes use it; existing rows still
decrypt under their stored version. Re-encrypt on next secret update. Never
remove a version still referenced by a stored row.

## Handling rules

- Server-side encryption only
- No plaintext storage, logs, analytics, audit metadata, monitor-version
  snapshots, or error responses
- Secrets are referenced by id from configuration snapshots, never inlined
- After creation, only a masked summary (`maskSecret`) is ever returned; full
  values are never read back
- Strict organization scoping on every secret row
- Foundation for future step-up authentication before secret replacement

## Interop test

`envelope_test.go::TestDecryptTypeScriptEnvelope` decrypts an envelope produced
by the TypeScript module (fixed all-`0x11` key) and asserts the plaintext
matches. `tests/monitor-secret-crypto.test.ts` asserts the produced envelope
matches the shared wire format. This proves the two implementations are
compatible in both directions.

## Managed KMS

If a managed key service becomes available, the keyring abstraction can be backed
by it without changing the wire format. Until then, the documented application
keyring with versioned rotation and strict environment handling is used.
