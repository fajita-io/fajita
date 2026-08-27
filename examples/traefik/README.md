# Traefik reverse proxy example

Terminate TLS in front of Fajita's web container with Traefik v3.

## Docker Compose labels (Traefik on the same host)

Add labels to the `web` service in your Compose override, or run Traefik as a separate stack that routes to `web:3000`:

```yaml
services:
  web:
    labels:
      - traefik.enable=true
      - traefik.http.routers.fajita.rule=Host(`monitor.example.com`)
      - traefik.http.routers.fajita.entrypoints=websecure
      - traefik.http.routers.fajita.tls.certresolver=letsencrypt
      - traefik.http.services.fajita.loadbalancer.server.port=3000
```

For a status subdomain:

```yaml
      - traefik.http.routers.fajita-status.rule=Host(`status.example.com`)
      - traefik.http.routers.fajita-status.entrypoints=websecure
      - traefik.http.routers.fajita-status.tls.certresolver=letsencrypt
      - traefik.http.routers.fajita-status.service=fajita
```

## Static file provider (Traefik on the host)

```yaml
# /etc/traefik/dynamic/fajita.yml
http:
  routers:
    fajita-web:
      rule: Host(`monitor.example.com`)
      entryPoints:
        - websecure
      service: fajita-web
      tls:
        certResolver: letsencrypt
  services:
    fajita-web:
      loadBalancer:
        servers:
          - url: http://127.0.0.1:3000
```

Ensure Traefik forwards:

- `Host`
- `X-Forwarded-For`
- `X-Forwarded-Proto`
- WebSocket upgrade headers (if you use realtime features)

## Environment

Set in `.env`:

```text
NEXT_PUBLIC_APP_URL=https://monitor.example.com
NEXT_PUBLIC_STATUS_PAGE_DOMAIN=status.example.com
```

Update Clerk allowed origins and the Clerk webhook URL to the public HTTPS host.

## Related docs

- [Configuration](../../docs/self-hosting/CONFIGURATION.md)
- [Troubleshooting (reverse proxy)](../../docs/self-hosting/TROUBLESHOOTING.md#reverse-proxy)
- [Caddy example](../caddy/README.md)
- [Nginx example](../nginx/README.md)
