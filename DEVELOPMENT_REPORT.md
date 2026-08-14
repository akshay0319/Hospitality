# HospitalityOS AI — Development Report

**As of:** 30 July 2026
**Status:** MVP in active development — backend + database fully operational, frontend live on core modules.

A single, AI-first Hospitality Operating System (PMS) for hotels, resorts, vacation rentals, hostels, and chains — competing with Mews, Cloudbeds, and Oracle OPERA.

---

## 1. Executive summary

| Layer | State |
|-------|-------|
| **Database** (XAMPP MariaDB) | ✅ Live — 20 tables, seeded demo property |
| **Backend** (NestJS + Prisma) | ✅ Live — 11 modules, ~50 endpoints, running on MariaDB |
| **Frontend** (Next.js 14) | ✅ Live — full themed UI; 7 pages wired to real APIs, rest designed/stubbed |
| **Auth** | ✅ Login + multi-step **registration** (creates company + property + owner) |
| **Onboarding** | ✅ Guided product tour + registration wizard |

**Everything runs locally inside XAMPP** — MariaDB via phpMyAdmin, backend on `:4000`, frontend on `:3000`.

---

## 2. Technology stack

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS v3** with a custom OKLCH design system
- **TanStack Query v5** (server state), **Zustand** (auth + UI state)
- **Recharts** (charts), **Lucide** (icons), **Sonner** (toasts)
- **Fonts:** Inter (body), Sora (display), JetBrains Mono (numbers)

### Backend
- **NestJS 10** + **TypeScript**
- **Prisma ORM 5** → **MySQL/MariaDB** provider
- **JWT** auth (access + rotating refresh tokens), **Passport.js**, **bcrypt**
- **class-validator** DTOs, **Swagger/OpenAPI** docs, **Helmet** + CORS + rate limiting

### Database
- **MariaDB 10.1.37** (XAMPP) — database `hospitality`
- Also ships a **PostgreSQL** schema variant (for future migration)

---

## 3. Architecture

- **Multi-tenant:** every record carries a `tenantId` (a company/chain). One tenant → many properties.
- **Property-scoped:** all operational data carries a `propertyId`. The JWT encodes both `tenantId` and `propertyId`; every query is filtered by them, isolating data per hotel.
- **Response envelope:** all API responses are `{ success, data, meta? }` via a global interceptor.
- **Global error filter:** consistent `{ success:false, statusCode, message, ... }` errors.
- **Audit interceptor:** writes every create/update/delete to `audit_logs`.
- **JSON-field bridge:** because MariaDB 10.1 lacks native arrays/JSON, former PostgreSQL `String[]`/`Json` fields are stored as JSON text and transparently (de)serialized by a Prisma middleware (`json-fields.ts`).

---

## 4. Database (20 tables)

Tenant → Property is the backbone; everything else hangs off Property.

**Core:** `tenants`, `properties`, `users`
**Inventory:** `room_types`, `rooms`
**Guests:** `guests`, `guest_preferences`, `loyalty_transactions`
**Rates:** `rate_plans`, `rate_plan_items`
**Bookings:** `reservations`, `reservation_extras`, `payments`, `folios`, `folio_charges`
**Operations:** `housekeeping_tasks`, `maintenance_tickets`
**Intelligence:** `ai_alerts`, `audit_logs`

**14 enums** cover roles, room/reservation/task/maintenance statuses, channels, loyalty tiers, payment methods, etc.

**Seeded demo data:** The Grand Meridian (New Delhi, 5★, 142 rooms) — 4 staff logins, 4 room types, 15 rooms, 3 guests, rate plans, 1 in-house reservation + folio, 2 AI alerts, 6 maintenance tickets.

**Deliverables in `/database`:** `schema.mariadb.sql`, `seed.mariadb.sql`, `seed-maintenance.mariadb.sql`, plus PostgreSQL variants and full docs (`DATABASE_MARIADB.md`, `DATABASE.md`).

---

## 5. Backend modules & endpoints (11 modules)

| Module | Key endpoints | Status |
|--------|--------------|--------|
| **Auth** | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `GET /me`, `PATCH /change-password` | ✅ Live |
| **Users** | CRUD staff, search, deactivate | ✅ Live |
| **Properties** | Property CRUD + RoomType CRUD | ✅ Live |
| **Rooms** | list/filter, create, update status, inventory calendar | ✅ Live |
| **Guests** | list/search, detail, create, update, preferences, loyalty points | ✅ Live |
| **Reservations** | availability, create, check-in, check-out, cancel, today summary | ✅ Live |
| **Housekeeping** | tasks, status, assign, dashboard, AI optimizer | ✅ Live |
| **Maintenance** | list/filter, detail, create, status, assign, dashboard | ✅ |
| **Context** | `GET /context/snapshot` — unified live property snapshot for AI grounding | ✅ |
| **AI Copilot** | `POST /ai/copilot` — OpenAI agentic tool-calling + gated write-actions, grounded on live data | ✅ |
| **Booking** | Public (no-auth) `/booking/:propertyId/*` — availability + direct booking with mock payment | ✅ **New** |
| **Revenue** | rate plans, rate grid, bulk rates, AI rate recommendations | ✅ Live |
| **Dashboard** | KPIs (occupancy, arrivals, departures, revenue, room status) | ✅ Live |
| **Analytics** | revenue trend, channel breakdown, occupancy heatmap, guest stats | ✅ Live |

**Business logic highlights:** 18% GST on bookings; availability engine (overlap counting vs inventory); check-in validates room is CLEAN & opens a folio; check-out closes folio, creates housekeeping task, updates guest lifetime value; AI rate engine (occupancy-based multipliers + weekend boost); AI housekeeping prioritizer.

Swagger UI: **http://localhost:4000/api/docs**

---

## 6. Frontend pages

### ✅ Live (wired to real backend + MariaDB)
| Page | What it does |
|------|--------------|
| **Login** | Real JWT auth, error handling |
| **Register** | 3-step wizard (Account → Property → Location) → creates company+property+owner, auto-login |
| **Dashboard** | Live KPI cards, reservation timeline, activity feed, housekeeping map, AI quick-ask + **guided tour** |
| **Reservations** | Live table + detail drawer + **4-step create wizard** (dates → live availability → guest search/create → review with GST → book) |
| **Guests** | Live list, search, stat tiles, detail drawer (profile, preferences, stay history, loyalty) |
| **Front Desk** | Live arrivals/in-house/departures + **working check-in & check-out** |
| **Analytics** | Live charts — revenue/occupancy trend, channel performance, loyalty breakdown, rooms sold |
| **Maintenance** | Live tickets, filters, stat tiles, detail drawer with status actions, **create-ticket form** |
| **Settings → Users & Roles** | Live staff table, inline role change, invite form, activate/deactivate |
| **Inventory Calendar** | 14-day room grid, reservation bars, room block/unblock with reason |
| **Guests (360°)** | Live list + enriched drawer: loyalty ledger, stay history, spend insights |
| **Revenue** | **Live editable rate grid** (click-to-edit persists) + **AI rate recs apply / accept-all** + demand forecast + competitor chart |

**Housekeeping** ✅ **live** — kanban board by task status, status-advance (syncs room state), live staff panel, working AI optimizer, auto-created cleaning task on check-out.

**AI Copilot** ✅ **live** — real OpenAI (gpt-4o-mini) with agentic tool-calling, grounded on the live property snapshot; interactive chat UI with thinking indicator + source chips.

### 🔲 Stub / "Coming soon" (no backend module yet)
- Channel Manager, Booking Engine, CRM, Loyalty, Communications, Voice AI, AI Agents, Concierge, Settings

---

## 7. Signature features

- **AI-first design language** — deep-space-navy OKLCH theme, violet reserved exclusively for AI features, glass-morphism, sparklines, live status dots.
- **Registration wizard** — full company/property/owner onboarding in 3 steps with per-step validation.
- **Guided onboarding tour** — spotlight coachmarks on each dashboard section (title, description, X/Skip/Next), progress dots, and a floating **?** button to replay anytime. Auto-starts for new users.
- **Multi-tenant, property-scoped security** end-to-end.
- **Design-system-consistent** detail drawers, stat tiles, tables, and forms reused across modules.

---

## 8. What's verified working (tested live)

- Register → auto-login → dashboard
- Login (all 4 seeded roles) with JWT + refresh rotation
- Dashboard KPIs, Guests list + detail, Analytics charts — real data from MariaDB
- **Front Desk check-out** flips reservation `CHECKED_IN → CHECKED_OUT` (persisted)
- **Maintenance** create, status change, assign, dashboard counts (persisted)
- JSON array fields (guest tags, room amenities) round-trip correctly
- Clean builds: backend `nest build`, frontend `next build` (all routes), `tsc` clean

---

## 9. Not yet built (candidate backlog)

**New backend modules needed:** Channel Manager (OTA sync), Booking Engine (direct booking widget), CRM/segments, Loyalty program engine, Communications (email/SMS/WhatsApp), Payments gateway integration, Billing/subscriptions.

**AI features needing LLM integration (API keys):** AI Copilot live answers, Voice AI, AI Agents, Concierge.

**To wire live (backend ready):** Housekeeping board, AI Copilot shell, Settings → Users & Roles (users API exists), Reservation create flow, Rate grid persistence.

**Infra/hardening:** tests, Redis caching, file uploads (ID docs, photos), production DB (Postgres or MariaDB 10.4+ upgrade), CI/CD, deployment.

---

## 10. How to run

```bash
# 1. Start XAMPP → MySQL (MariaDB) must be running

# 2. Backend
cd backend
npm run start:dev        # → http://localhost:4000/api/v1  (Swagger: /api/docs)

# 3. Frontend (new terminal)
npm run dev              # → http://localhost:3000
```

**Demo logins** (password `demo1234`): `manager@grandmeridian.in` (GM), `frontdesk@`, `revenue@`, `housekeeping@`
Or create a fresh account at **/register**.

---

## 11. Repository map

```
Hospitality/
├── app/                      # Next.js pages (auth + dashboard route groups)
├── components/               # UI kit, layout, tour, dashboard widgets
├── lib/                      # api client, services, mappers, sample data
├── store/                    # Zustand (auth, ui)
├── database/                 # SQL schema + seeds + DB docs (MariaDB & Postgres)
├── backend/
│   ├── prisma/schema.prisma  # 20 models, 14 enums (MySQL provider)
│   └── src/modules/          # 11 feature modules
├── PLAN.md                   # original milestone plan
├── LOVABLE_PROMPT.md         # design-system source prompt
└── DEVELOPMENT_REPORT.md     # this file
```

---

*Ready for the next plan. Tell me which modules to prioritize and I'll build them the same way — backend module → seed → live UI → verified end-to-end.*
