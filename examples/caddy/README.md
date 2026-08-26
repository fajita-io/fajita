# Caddy reverse proxy example

Terminate TLS in front of Fajita's web container.

```text
monitor.example.com {
  reverse_proxy localhost:3000
}

status.example.com {
  reverse_proxy localhost:3000
}
```

Set in `.env`:

```text
NEXT_PUBLIC_APP_URL=https://monitor.example.com
NEXT_PUBLIC_STATUS_PAGE_DOMAIN=status.example.com
```

Ensure Clerk allowed origins and webhook URLs use the public HTTPS host.

## Related docs

- [Configuration](../../docs/self-hosting/CONFIGURATION.md)
- [Security (self-hosted)](../../docs/self-hosting/SECURITY.md)
