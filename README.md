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
