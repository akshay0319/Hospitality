# 🏨 HospitalityOS AI

An **AI-first Hotel Operating System** (Property Management System) — a modern alternative to Mews / Cloudbeds / OPERA. Front desk, reservations, a public booking engine with **real Razorpay payments**, housekeeping, revenue management, CRM, analytics, and an **AI Copilot + Voice assistant** — all in one app.

- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind) — runs on **http://localhost:3000**
- **Backend:** NestJS 10 + Prisma 5 — REST API on **http://localhost:4000/api/v1**
- **Database:** MariaDB / MySQL (works great with XAMPP)

---

## 📑 Table of contents

1. [Features](#-features)
2. [Tech stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Quick start (TL;DR)](#-quick-start-tldr)
5. [Detailed setup](#-detailed-setup)
6. [Demo logins & key URLs](#-demo-logins--key-urls)
7. [Environment variables](#-environment-variables)
8. [Resetting the demo data](#-resetting-the-demo-data)
9. [Project structure](#-project-structure)
10. [Handy commands](#-handy-commands)
11. [Troubleshooting](#-troubleshooting)

---

## ✨ Features

| Module | What it does |
|---|---|
| **PMS Engine** | Reservations (create / modify / reprice / cancel), availability, check-in / check-out, inventory calendar, room blocking |
| **Booking Engine** | Public booking page → availability → add-ons/upsell → promo codes → **Razorpay checkout** → confirmed reservation. Guest **self-service Manage page** (look up + cancel by confirmation # + email) |
| **Front Desk** | Arrivals / departures / in-house board, one-click check-in/out |
| **Housekeeping** | Task board with status flow + heuristic optimizer, auto-tasks on checkout |
| **Maintenance** | Work-order board with assignment + priorities |
| **Revenue** | Rate plans, editable rate grid, AI rate recommendations + autopilot, demand forecast |
| **CRM** | Guest 360° profiles, preferences, live segments (VIP / Platinum / Returning / High-value) |
| **AI Copilot & Voice** | Chat + browser voice assistant (OpenAI), grounded on live property data |
| **Analytics** | Revenue trend, channel mix, occupancy heatmap, CSV export |
| **Auth** | Multi-tenant, JWT + refresh, role-based access, audit log |

---

## 🧰 Tech stack

**Frontend:** Next.js 14 · React 18 · TypeScript · Tailwind CSS v3 · TanStack Query v5 · Zustand · Recharts · Lucide · Sonner
**Backend:** NestJS 10 · Prisma 5 · class-validator · Passport JWT · Swagger
**Database:** MariaDB 10.1+ / MySQL 5.7+ (XAMPP)
**AI:** OpenAI (gpt-4o-mini) · Web Speech API (browser-native voice)
**Payments:** Razorpay Standard Checkout (test mode ready)

---

## ✅ Prerequisites

Install these first:

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | 18+ (20/22 recommended) | [nodejs.org](https://nodejs.org) |
| **Git** | any | [git-scm.com](https://git-scm.com) |
| **XAMPP** | with MariaDB/MySQL | [apachefriends.org](https://www.apachefriends.org) — or any standalone MySQL 5.7+/MariaDB 10.1+ |

> 💡 XAMPP ships MariaDB **and** phpMyAdmin (a friendly GUI for importing the database). That's the easiest path on Windows.

---

## 🚀 Quick start (TL;DR)

For someone who knows the drill. Full explanations are in [Detailed setup](#-detailed-setup) below.

```bash
# 1. Clone
git clone https://github.com/akshay0319/Hospitality.git
cd Hospitality

# 2. Start MySQL (XAMPP Control Panel → Start MySQL), then create + load the DB
#    (adjust the mysql.exe path to your XAMPP install)
"C:/xampp/mysql/bin/mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS hospitality;"
"C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/schema.mariadb.sql
"C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/seed.mariadb.sql
"C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/seed-housekeeping.mariadb.sql
"C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/seed-maintenance.mariadb.sql
"C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/promo-codes.mariadb.sql
"C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/reseed-demo-today.mariadb.sql

# 3. Backend
cd backend
npm install
cp .env.example .env          # then open .env and fill values (see below)
npx prisma generate
npm run build
npm start                     # → http://localhost:4000

# 4. Frontend (new terminal, from repo root)
npm install
npm run dev                   # → http://localhost:3000
```

Open **http://localhost:3000**, log in with `manager@grandmeridian.in` / `demo1234`.

---

## 🔧 Detailed setup

### Step 1 — Clone the repo

```bash
git clone https://github.com/akshay0319/Hospitality.git
cd Hospitality
```

The repo has two apps:
- **Root** (`/`) = the Next.js frontend
- **`/backend`** = the NestJS API

### Step 2 — Set up the database

The app uses a MariaDB/MySQL database named **`hospitality`**.

1. **Start MySQL** — open the XAMPP Control Panel and click **Start** next to *MySQL*.
2. **Create the database + import the SQL files**, in this exact order:

   | Order | File | What it adds |
   |---|---|---|
   | 1 | `database/schema.mariadb.sql` | All tables + auto-UUID triggers |
   | 2 | `database/seed.mariadb.sql` | Demo hotel, users, rooms, a reservation |
   | 3 | `database/seed-housekeeping.mariadb.sql` | Housekeeping tasks |
   | 4 | `database/seed-maintenance.mariadb.sql` | Maintenance work orders |
   | 5 | `database/promo-codes.mariadb.sql` | Promo codes (`WELCOME10`, `FLAT500`) |
   | 6 | `database/reseed-demo-today.mariadb.sql` | **Anchors demo dates to today** (arrivals/departures/tasks show up) |

   **Option A — command line** (adjust the path to *your* XAMPP install, often `C:/xampp/...`):
   ```bash
   "C:/xampp/mysql/bin/mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS hospitality;"
   "C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/schema.mariadb.sql
   "C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/seed.mariadb.sql
   "C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/seed-housekeeping.mariadb.sql
   "C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/seed-maintenance.mariadb.sql
   "C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/promo-codes.mariadb.sql
   "C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/reseed-demo-today.mariadb.sql
   ```

   **Option B — phpMyAdmin (GUI, beginner-friendly):**
   1. Open **http://localhost/phpmyadmin**
   2. **New** → database name `hospitality` → **Create**
   3. Select `hospitality` → **Import** tab → choose each SQL file above **in order** → **Go**

> **Default DB credentials** (XAMPP): user `root`, **no password**, host `127.0.0.1`, port `3306`. If yours differs, update `DATABASE_URL` in `backend/.env` (next step).

### Step 3 — Configure & run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Now open **`backend/.env`** and set the values. The minimum to boot:

```env
DATABASE_URL="mysql://root@localhost:3306/hospitality"
JWT_SECRET=any-long-random-string
JWT_REFRESH_SECRET=another-long-random-string
```

Optional (features degrade gracefully if left blank):
```env
OPENAI_API_KEY=sk-...            # enables AI Copilot / Voice
RAZORPAY_KEY_ID=rzp_test_...     # enables real payments; blank = mock gateway
RAZORPAY_KEY_SECRET=...
```

Generate the Prisma client, build, and start:

```bash
npx prisma generate
npm run build
npm start          # production build → http://localhost:4000
# — or for hot-reload during development —
npm run start:dev
```

You should see `Nest application successfully started` and `Database connected`.
Swagger API docs: **http://localhost:4000/api/docs**

### Step 4 — Run the frontend

In a **new terminal**, from the repo root:

```bash
npm install
npm run dev        # dev server with hot-reload → http://localhost:3000
# — or a production build —
npm run build && npm start
```

> The frontend talks to the backend at `http://localhost:4000/api/v1` **by default** — no config needed. To point at a different backend, create a `.env.local` in the repo root with:
> ```env
> NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
> ```

### Step 5 — Log in 🎉

Open **http://localhost:3000**, use a [demo login](#-demo-logins--key-urls) below.

---

## 🔑 Demo logins & key URLs

All demo users share the password **`demo1234`**.

| Email | Role |
|---|---|
| `manager@grandmeridian.in` | General Manager (full access) |
| `frontdesk@grandmeridian.in` | Front Desk |
| `revenue@grandmeridian.in` | Revenue Manager |
| `housekeeping@grandmeridian.in` | Housekeeping Supervisor |

**Key pages:**

| URL | What |
|---|---|
| http://localhost:3000 | Dashboard (after login) |
| http://localhost:3000/book/prop_grand_meridian | **Public booking engine** (no login) |
| http://localhost:3000/book/prop_grand_meridian/manage | **Manage a booking** (look up + cancel) |
| http://localhost:4000/api/docs | Swagger API reference |

**Razorpay test card** (when live keys are set): `4111 1111 1111 1111`, any future expiry, any CVV, any OTP.

---

## 🌱 Environment variables

**`backend/.env`** (copy from `backend/.env.example`):

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | `mysql://USER:PASS@HOST:PORT/hospitality` (XAMPP: `mysql://root@localhost:3306/hospitality`) |
| `JWT_SECRET` | ✅ | Secret for access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret for refresh tokens |
| `PORT` | — | Backend port (default `4000`) |
| `FRONTEND_URL` | — | CORS origin (default `http://localhost:3000`) |
| `OPENAI_API_KEY` | — | Enables AI Copilot & Voice; blank = AI disabled |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | — | Enables real Razorpay checkout; blank = built-in **mock** gateway |

**Root `.env.local`** (optional — frontend):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL. Defaults to `http://localhost:4000/api/v1` if unset |

> ⚠️ **Never commit `.env` files** — they're already in `.gitignore`. `RAZORPAY_KEY_SECRET` and `OPENAI_API_KEY` must stay server-side only.

---

## ♻️ Resetting the demo data

Demo dates drift over time (empty housekeeping board, no arrivals today). Re-anchor everything to **today**:

```bash
"C:/xampp/mysql/bin/mysql.exe" -u root hospitality < database/reseed-demo-today.mariadb.sql
```

To fully wipe and rebuild the database, re-run the whole import list from [Step 2](#step-2--set-up-the-database).

---

## 🗂 Project structure

```
Hospitality/
├── app/                      # Next.js frontend (App Router)
│   ├── (auth)/               #   login / register
│   ├── (dashboard)/          #   dashboard, reservations, front-desk, housekeeping, revenue, crm, …
│   └── book/[propertyId]/    #   PUBLIC booking engine + /manage page
├── components/               # Shared UI (layout, sidebar, header, tour)
├── lib/                      # API client, services, formatters, stores
├── store/                    # Zustand stores (auth, ui)
├── database/                 # SQL schema + seed files (import these)
├── backend/
│   ├── src/modules/          # NestJS feature modules (booking, reservations, revenue, ai, …)
│   ├── prisma/schema.prisma  # Data model (provider = mysql)
│   └── .env.example          # Backend env template
└── README.md
```

---

## 🛠 Handy commands

**Frontend** (repo root):
```bash
npm run dev          # dev server (hot reload)
npm run build        # production build
npm start            # serve the production build
npm run lint         # eslint
```

**Backend** (`/backend`):
```bash
npm run start:dev    # dev server (hot reload)
npm run build        # compile to dist/
npm start            # run compiled build (node dist/main)
npx prisma generate  # regenerate Prisma client after schema changes
npx prisma studio    # visual DB browser
```

---

## 🐞 Troubleshooting

| Symptom | Fix |
|---|---|
| **Backend: `P1001 Can't reach database server`** | MySQL isn't running. Start it in the XAMPP Control Panel. |
| **Backend: `Access denied for user 'root'`** | Your MySQL root has a password. Put it in `DATABASE_URL`: `mysql://root:YOURPASS@localhost:3306/hospitality`. |
| **`mysql.exe` not found** | Use the correct XAMPP path (commonly `C:/xampp/mysql/bin/mysql.exe`), or import via phpMyAdmin instead. |
| **`Error: listen EADDRINUSE :4000` / `:3000`** | Another process holds the port. Close it, or change `PORT` (backend) / run `next dev -p 3001` (frontend). |
| **Empty housekeeping board / no arrivals today** | Run the reseed script — see [Resetting the demo data](#-resetting-the-demo-data). |
| **Login fails / 401 loops** | Confirm the backend is up at `:4000` and the DB was seeded (users exist). Password is `demo1234`. |
| **AI Copilot says it's disabled** | Set `OPENAI_API_KEY` in `backend/.env` and restart the backend. |
| **Payment shows "Demo gateway"** | That's expected without Razorpay keys. Add `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` to `backend/.env` and restart for live test-mode checkout. |
| **Prisma errors after pulling changes** | Run `npx prisma generate` in `/backend`. |

> Some older docs under `/database` (e.g. `DATABASE_MARIADB.md` §5) predate the switch to the MySQL Prisma provider and mention PostgreSQL — the backend now runs on MariaDB/MySQL as described in this README.

---

**Built with ❤️ for modern hospitality.**
