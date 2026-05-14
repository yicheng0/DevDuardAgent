# Production deploy

This is the fastest first-version deployment path for one Linux server.

## 1. Check config

The production files are already present locally:

- `.env`
- `manifest/config/config.yaml`

Before exposing the service, check `.env`:

- Keep `HTTP_PORT=80` for temporary IP access.
- Keep data directories under `/data/devguard` unless the server has a different disk layout.
- `DEVGUARD_CONFIG_FILE` should stay `./manifest/config/config.yaml`.

Check `manifest/config/config.yaml`:

- Keep `file_dir: data/uploads`.
- Keep `milvus.address: localhost:19530`.
- Confirm model, embedding, and MCP credentials are valid.
- Use `admin.config_token` as the frontend settings token. If you change it online, the same YAML file is updated.

Do not commit `.env` or `manifest/config/config.yaml`.

## 2. Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The public entry point is:

```text
http://SERVER_IP/
```

Only ports `80` and SSH need to be open to the public internet.

## 3. Verify

```bash
docker compose -f docker-compose.prod.yml ps
curl -i http://127.0.0.1/
curl -i http://127.0.0.1/api/config/runtime
```

The config API should return unauthorized without `X-Admin-Token`.
Use the frontend settings page with `admin.config_token` from `manifest/config/config.yaml` to test model, embedding, and Milvus connectivity.

For local troubleshooting, keep service ports separate:

- Backend API: `8000`
- Frontend dev server: `8080`
- Milvus gRPC: `19530`
- Attu UI: `8001`

Windows diagnostics:

```powershell
docker compose -f manifest/docker/docker-compose.yml ps
Test-NetConnection 127.0.0.1 -Port 19530
Invoke-RestMethod http://127.0.0.1:8000/api/knowledge/health
```

## 4. Important security note

Any API keys previously committed in `manifest/config/config.yaml` should be rotated before exposing the service.
