# Personal Finance Tracker — Project Specification

## Project Overview

A full-stack web application that allows users to track personal income and expenses. Users can add, edit,get, and delete financial transactions, view a categorized summary of their spending, and visualize their finances through a pie chart. The app is designed for individuals who want a simple, no-frills tool to monitor their financial activity.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14+ (App Router), React, Tailwind CSS |
| Charts      | Recharts (PieChart)                 |
| Backend     | FastAPI (Python)                    |
| Database    | PostgreSQL via Neon (serverless)    |
| ORM         | SQLAlchemy                          |
| Validation  | Pydantic v2                         |
| Backend Testing | pytest                          |
| Frontend Testing | Vitest + React Testing Library |
| Package Manager (Python) | uv                   |
| Package Manager (JS) | npm / pnpm             |
| Deployment  | Local dev only (for submission)     |

---

## Frontend Design Requirements

### Visual Style

- **Color Scheme**: Dark mode by default
  - Primary: Purple-to-blue gradient (`#7C3AED` → `#3B82F6`)
  - Accent: Teal (`#14B8A6`)
  - Background: Deep dark (`#0F0F1A`, `#1A1A2E`)
  - Surface: Slightly lighter dark (`#16213E`, `#1F2937`)
  - Text: White / light gray (`#F9FAFB`, `#9CA3AF`)
- **Typography**: Clean sans-serif (Inter or system font), clear visual hierarchy with size contrast
- **Overall Feel**: Premium, modern, inspired by banking/fintech apps (e.g., Revolut, Wise)

### UI Components Style

- **Cards**: Glassmorphism effect — semi-transparent background, backdrop blur, subtle border (`border-white/10`)
- **Summary Cards (Dashboard)**:
  - Total Income: Green gradient (`#10B981` → `#059669`)
  - Total Expenses: Red gradient (`#EF4444` → `#DC2626`)
  - Net Balance: Blue-purple gradient (`#6366F1` → `#7C3AED`)
  - Each card has an icon, label, and large value
- **Chart**: Animated donut chart (PieChart with inner radius) using matching category colors
- **Forms**: Minimalist — dark inputs with subtle borders, focus ring in primary color, clear labels
- **Buttons**: Gradient fill for primary actions, ghost/outline for secondary; slight scale on hover
- **Transaction List**: Color-coded amounts (green for income, red for expense), category badges, subtle row hover

### Animations & Interactions

- **Page transitions**: Fade-in on mount (opacity 0 → 1, slight translateY)
- **Micro-interactions**:
  - Buttons scale slightly on hover (`scale-105`) and press (`scale-95`)
  - Cards elevate on hover (box-shadow increase)
  - Form fields have smooth focus transitions
- **Loading states**: Skeleton loaders (pulsing gray blocks) instead of spinners where possible
- **Delete confirmation**: Animated modal/dialog with backdrop blur, not a native browser `confirm()`

### Libraries to Use

| Purpose            | Library                          |
|--------------------|----------------------------------|
| Styling            | Tailwind CSS (already in stack)  |
| Animations         | Framer Motion                    |
| Charts             | Recharts (already in stack)      |
| Icons              | Lucide React                     |

### Responsive Design

- **Mobile-first**: All layouts designed for small screens first, enhanced for larger
- **Breakpoints**: Standard Tailwind (`sm`, `md`, `lg`) — no custom breakpoints needed
- **Navbar**: Collapsible or hamburger menu on mobile, horizontal links on desktop
- **Dashboard**: Summary cards stack vertically on mobile, grid on desktop
- **Transaction List**: Card-based layout on mobile (not a wide table), table on desktop

### Professional Banking App Aesthetic

- Generous whitespace and padding — avoid cramped layouts
- Consistent border-radius (`rounded-xl`, `rounded-2xl`) throughout
- Visual hierarchy: large numbers for key metrics, smaller supporting text
- Subtle background gradients or patterns on page background (not flat black)
- Smooth, purposeful animations — nothing jarring or excessive

---

## Database Schema

### Table: `transactions`

| Column       | Type         | Constraints              |
|--------------|--------------|--------------------------|
| `id`         | Integer      | Primary Key, auto-increment |
| `amount`     | Float        | Not null                 |
| `type`       | String       | `"income"` or `"expense"` |
| `category`   | String       | Not null                 |
| `description`| String       | Optional                 |
| `date`       | Date         | Not null                 |

### Valid Categories

- Income: `Salary`, `Freelance`, `Investment`, `Other`
- Expense: `Food`, `Housing`, `Transport`, `Entertainment`, `Healthcare`, `Shopping`, `Other`

---

## API Endpoints

| Method | URL                          | Purpose                                      |
|--------|------------------------------|----------------------------------------------|
| GET    | `/transactions`              | Retrieve all transactions                    |
| POST   | `/transactions`              | Create a new transaction                     |
| GET    | `/transactions/{id}`         | Retrieve a single transaction by ID          |
| PUT    | `/transactions/{id}`         | Update an existing transaction               |
| DELETE | `/transactions/{id}`         | Delete a transaction                         |
| GET    | `/summary`                   | Return total income, total expenses, net balance, and per-category breakdown |

---

## Frontend Pages

### Dashboard (`/`)
- Displays total income, total expenses, and net balance as summary cards
- Renders a PieChart showing expense breakdown by category
- Links to the full transaction list

### Transactions List (`/transactions`)
- Displays all transactions in a table or card list
- Each row shows: date, type, category, description, amount
- Provides Edit and Delete buttons per transaction
- Includes a link/button to add a new transaction

### Add / Edit Transaction (`/transactions/new` and `/transactions/[id]/edit`)
- Form with fields: amount, type (income/expense), category, description, date
- Category dropdown changes based on selected type
- On submit, calls the appropriate backend endpoint via a Server Action
- Redirects back to the transaction list on success

### Navbar
- Persistent navigation across all pages
- Links: Home (Dashboard), Transactions

---

## Phase-wise Task Checklist

### Phase 0: Foundation Setup

- Status: Done —Create a new GitHub repository named `personal-finance-tracker`
- Status: Done —Create a Neon PostgreSQL database and copy the connection string
- Status: Done —Initialize the Python backend with `uv init` inside a `backend/` directory
- Status: Done —Initialize the Next.js frontend with `npx create-next-app@latest` inside a `frontend/` directory
- Status: Done —Create a root `.gitignore` covering `__pycache__`, `.env`, `node_modules`, `.next`, `*.pyc`, and `.venv`
- Status: Done —Create a `backend/.env` file with `DATABASE_URL` set to the Neon connection string
- Status: Done —Create a `frontend/.env.local` file with `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Status: Done —Verify both `backend/` and `frontend/` directories are committed to GitHub

---

### Phase 1: Backend Development

- Status: Done —Add FastAPI, SQLAlchemy, psycopg2-binary, python-dotenv, and uvicorn as dependencies via `uv add`
- Status: Not Done —Create `backend/database.py` — set up SQLAlchemy engine and `SessionLocal` using `DATABASE_URL` from `.env`
- Status: Not Done —Create `backend/models.py` — define the `Transaction` SQLAlchemy model with all required columns
- Status: Not Done —Create `backend/schemas.py` — define Pydantic schemas: `TransactionCreate`, `TransactionUpdate`, `TransactionResponse`, and `SummaryResponse`
- Status: Not Done —Create `backend/main.py` — initialize FastAPI app, call `Base.metadata.create_all()` on startup
- Status: Not Done —Implement `GET /transactions` endpoint returning all transactions
- Status: Not Done —Implement `POST /transactions` endpoint creating a new transaction
- Status: Not Done —Implement `GET /transactions/{id}` endpoint returning a single transaction or 404
- Status: Not Done —Implement `PUT /transactions/{id}` endpoint updating a transaction or 404
- Status: Not Done —Implement `DELETE /transactions/{id}` endpoint deleting a transaction or 404
- Status: Not Done —Implement `GET /summary` endpoint computing total income, total expenses, net balance, and category breakdown
- Status: Not Done —Configure CORS in `main.py` to allow requests from `http://localhost:3000`
- Status: Not Done —Run the backend with `uvicorn main:app --reload` and verify all endpoints via browser or curl

---

### Phase 2: Frontend Development

- Status: Not Done —Install dependencies: `recharts`, `@testing-library/react`, `vitest`, and any required types
- Status: Not Done —Create `frontend/lib/actions.ts` — implement Server Actions for `getTransactions`, `createTransaction`, `updateTransaction`, `deleteTransaction`, and `getSummary`
- Status: Not Done —Build the `Navbar` component with navigation links to Dashboard and Transactions
- Status: Not Done —Build the Dashboard page (`app/page.tsx`) displaying summary cards (total income, total expenses, net balance)
- Status: Not Done —Integrate a `PieChart` (Recharts) on the Dashboard showing expense breakdown by category
- Status: Not Done —Build the Transactions list page (`app/transactions/page.tsx`) displaying all transactions in a table
- Status: Not Done —Add Edit and Delete buttons to each row in the Transactions list, wired to the appropriate Server Actions
- Status: Not Done —Build the `TransactionForm` component with controlled inputs for amount, type, category, description, and date
- Status: Not Done —Implement category dropdown logic so options change based on the selected transaction type
- Status: Not Done —Build the Add Transaction page (`app/transactions/new/page.tsx`) using `TransactionForm`
- Status: Not Done —Build the Edit Transaction page (`app/transactions/[id]/edit/page.tsx`) pre-populated with existing data
- Status: Not Done —Apply Tailwind CSS styling for a clean, readable layout across all pages

---

### Phase 3: Integration

- Status: Not Done —Confirm the backend is running and accessible at `http://localhost:8000`
- Status: Not Done —Confirm the frontend is running and accessible at `http://localhost:3000`
- Status: Not Done —Test end-to-end: add a new transaction via the frontend form and verify it appears in the list
- Status: Not Done —Test end-to-end: edit an existing transaction and verify the update is reflected
- Status: Not Done —Test end-to-end: delete a transaction and verify it is removed from the list
- Status: Not Done —Verify the Dashboard summary cards and pie chart update correctly after add/edit/delete operations
- Status: Not Done —Confirm no CORS errors appear in the browser console during any API calls

---

### Phase 4: Testing

- Status: Not Done —Add `pytest` and `httpx` as dev dependencies via `uv add --dev`
- Status: Not Done —Create `backend/test_main.py` with a pytest fixture that sets up a test database and FastAPI `TestClient`
- Status: Not Done —Write a pytest test: `POST /transactions` creates a transaction and returns 200 with correct data
- Status: Not Done —Write a pytest test: `GET /transactions` returns a list containing the created transaction
- Status: Not Done —Write a pytest test: `PUT /transactions/{id}` updates the transaction and returns updated data
- Status: Not Done —Write a pytest test: `DELETE /transactions/{id}` removes the transaction and returns success
- Status: Not Done —Write a pytest test: `GET /summary` returns correct totals after inserting known transactions
- Status: Not Done —Run all backend tests with `pytest` and confirm ≥5 tests pass
- Status: Not Done —Create `frontend/vitest.config.ts` and configure Vitest with jsdom environment
- Status: Not Done —Write a Vitest test: `TransactionForm` renders all required input fields
- Status: Not Done —Write a Vitest test: `TransactionForm` shows income-specific categories when type is set to "income"
- Status: Not Done —Write a Vitest test: `Navbar` renders links to Dashboard and Transactions
- Status: Not Done —Run all frontend tests with `npx vitest run` and confirm ≥3 tests pass

---

### Phase 5: Documentation & Submission

- Status: Not Done —Create `README.md` at the project root with: project description, tech stack, setup instructions for backend and frontend, how to run tests, and screenshots
- Status: Not Done —Create `.env.example` in `backend/` listing required environment variables without values
- Status: Not Done —Create `.env.example` in `frontend/` listing `NEXT_PUBLIC_API_URL` without a value
- Status: Not Done —Add at least one screenshot of the Dashboard to the README
- Status: Not Done —Add at least one screenshot of the Transactions list to the README
- Status: Not Done —Ensure all code is committed and pushed to GitHub
- Status: Not Done —Submit the GitHub repository link per assignment instructions
