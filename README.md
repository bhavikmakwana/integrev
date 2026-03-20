# Deal MVP (Node + Express + Postgres + React)

Quick scaffold for the MVP described: backend API (Express), Postgres schema, and a small React frontend.

Backend (c:/codebook/app/backend)
- Copy `.env.example` to `.env` and set `DATABASE_URL` and `PORT`.
- Install and run:

```bash
cd backend
npm install
node index.js
```

This will run DB init (creates `deals` table) and start the API on the configured port (default 4000).

Frontend (c:/codebook/app/frontend)
- Starts a small React UI (Parcel dev server).

```bash
cd frontend
npm install
npm start
```

Notes:
- The backend exposes:
  - `POST /api/deals/precheck` to compute a duplicate confidence score and reasoning
  - `POST /api/deals/submit` to insert the deal (status may be `flagged` based on score)
  - `GET /api/deals` to list all deals
  - `GET /api/deals/:id` to fetch a deal by id
  - `PUT /api/deals/:id` to update a deal
  - `DELETE /api/deals/:id` to delete a deal
  - `GET /api/admin/flagged` to list flagged deals
  - `POST /api/admin/review` to approve/reject

Notes about new fields:
  - The deal form now includes a `cost_matrix` field (textarea) — you can paste JSON or free text.
  - The backend stores `cost_matrix` in a `JSONB` column and will attempt to parse JSON strings when saving.

Next steps you might want me to do:
- Add authentication/roles (Sales User vs Admin)
- Add tests and database migrations
- Wire real string fuzzy-matching or integrate Postgres trigram index
- Add improved UI: list (CRUD) screen is available — you can view, edit, and delete deals from the frontend 'List' view.

## Docker Local Run and Deployment

### 1) Build and run locally with Docker Compose
From the project root (`c:/codebook/app`):

1. Create or update `backend/.env` (already included) with:

```ini
PORT=5000
DATABASE_URL=postgres://user:pass@db:5432/deals
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=deals
```

2. Start services:

```bash
docker compose up --build
```

Then visit:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### 2) Stop the local container stack

```bash
docker compose down
```

### 3) Deploy to a Docker host (e.g., VPS / cloud VM)
1. Build backend image:

```bash
docker build -t deal-mvp-backend ./backend
```

2. Build frontend image:

```bash
docker build -t deal-mvp-frontend ./frontend
```

3. Run the database and backend:

```bash
docker run -d --name deal-mvp-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=deals -p 5432:5432 postgres:16-alpine

docker run -d --name deal-mvp-backend --link deal-mvp-db:db -e DATABASE_URL=postgres://user:pass@db:5432/deals -e PORT=5000 -p 5000:5000 deal-mvp-backend
```

4. Run the frontend (nginx serving built static files):

```bash
docker run -d --name deal-mvp-frontend -p 3000:80 deal-mvp-frontend
```

### 4) Verify and test
- Open `http://localhost:3000` for the frontend
- Use the API endpoints on `http://localhost:5000`

> If your frontend cannot reach the backend, update api URLs in `frontend/src/App.jsx` to `http://localhost:5000` for local testing.

### Single-image deployment (Render.com / one Docker image)
From project root (`c:/codebook/app`):

```bash
docker build -t deal-mvp .
docker run -p 5000:5000 --env-file backend/.env deal-mvp
```

Then open `http://localhost:5000`.

On Render, configure the service to build from this repository with the root `Dockerfile`, set port to `5000`, and add env var `PORT=5000` (plus the database URL).

