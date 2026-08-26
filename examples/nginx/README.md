# Nginx reverse proxy example

Minimal TLS reverse proxy for the web service on port 3000.

```nginx
server {
  listen 443 ssl http2;
  server_name monitor.example.com;

  ssl_certificate     /etc/ssl/certs/monitor.example.com.pem;
  ssl_certificate_key /etc/ssl/private/monitor.example.com.key;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

Set `NEXT_PUBLIC_APP_URL=https://monitor.example.com` and configure Clerk accordingly.

## Related docs

- [Troubleshooting](../../docs/self-hosting/TROUBLESHOOTING.md#reverse-proxy)
- [Docker Compose example](../docker-compose/README.md)
