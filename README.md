# Personal Finance Tracker

A full-stack web application for tracking personal income and expenses. Add, edit, and delete transactions, view categorized spending summaries, and visualize finances through an interactive pie chart.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | Next.js 14+ (App Router), React, Tailwind CSS   |
| Charts      | Recharts                                        |
| Backend     | FastAPI (Python)                                |
| Database    | PostgreSQL via Neon (serverless)                |
| ORM         | SQLAlchemy                                      |
| Validation  | Pydantic v2                                     |
| Backend Tests | pytest                                        |
| Frontend Tests | Vitest + React Testing Library               |

---

## Folder Structure

```
personal-finance-tracker/
├── backend/          # FastAPI Python backend
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── pyproject.toml
│   └── .env          # (not committed)
├── frontend/         # Next.js frontend
│   ├── app/
│   ├── lib/
│   ├── package.json
│   └── .env.local    # (not committed)
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Backend

```bash
cd backend
uv sync
uvicorn main:app --reload
```

> Requires a `.env` file with `DATABASE_URL` set to your Neon PostgreSQL connection string.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Requires a `.env.local` file with `NEXT_PUBLIC_API_URL=http://localhost:8000`.

---

## Status

> Phase 0 complete, Phase 1 in progress.
