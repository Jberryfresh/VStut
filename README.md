# VStut — Todo App (Docker + Postgres)

Run the app locally with Docker Desktop (Node + Postgres):

1. Build and start services:

```bash
docker-compose up --build
```

2. Open the app at: http://localhost:3000

Notes:
- The web server serves the static frontend and exposes a simple REST API at `/api/todos`.
- Postgres data is persisted in a Docker volume named `db_data`.
