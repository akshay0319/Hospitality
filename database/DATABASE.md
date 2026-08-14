# HospitalityOS AI — Database Reference

Complete PostgreSQL data model for the HospitalityOS AI platform. This is a **faithful 1:1 port of `backend/prisma/schema.prisma`** — every table and column name matches the Prisma client exactly, so the NestJS backend connects with **zero changes**.

- **Engine:** PostgreSQL 13+
- **Tables:** 19 · **Enum types:** 14 · **Indexes:** 18 · **Triggers:** 12 (auto `updatedAt`)
- **Files in this folder:**
  - [`schema.postgres.sql`](schema.postgres.sql) — full DDL (types, tables, FKs, indexes, triggers)
  - [`seed.postgres.sql`](seed.postgres.sql) — demo property + users + rooms + a live reservation
  - `DATABASE.md` — this document

---

## 1. How to create the database

### Option A — Command line (psql)

```bash
# 1. Create the database
createdb hospitality_os
#   …or:  psql -U postgres -c "CREATE DATABASE hospitality_os;"

# 2. Build the schema
psql -d hospitality_os -f database/schema.postgres.sql

# 3. Load demo data (optional but recommended)
psql -d hospitality_os -f database/seed.postgres.sql
```

### Option B — pgAdmin (GUI)

1. Right-click **Databases → Create → Database** → name it `hospitality_os`.
2. Select it → **Query Tool** → open `schema.postgres.sql` → **Run** (▶ / F5).
3. Open `seed.postgres.sql` in the Query Tool → **Run**.

> Both files are plain ANSI SQL with no `psql`-only meta-commands, so they run in either tool.

### Point the backend at it

In `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hospitality_os?schema=public"
```

Then generate the client (no migration needed — the SQL already built the tables):

```bash
cd backend
npx prisma generate
npx prisma db pull      # optional: confirms Prisma sees the schema identically
npm run start:dev
```

**Demo logins** (all use password `demo1234`):

| Email | Role |
|---|---|
| `manager@grandmeridian.in` | General Manager |
| `frontdesk@grandmeridian.in` | Front Desk |
| `revenue@grandmeridian.in` | Revenue Manager |
| `housekeeping@grandmeridian.in` | Housekeeping Supervisor |

---

## 2. Architecture model

Two scoping keys flow through the whole schema:

- **`tenantId`** — multi-tenancy. One company (e.g. a hotel chain) = one tenant. Lives on `tenants`, `properties`, `users`.
- **`propertyId`** — every operational row belongs to exactly one property (hotel). Lives on rooms, guests, reservations, rate plans, tasks, tickets, alerts, audit logs.

The JWT issued at login carries both, and every backend query filters by them — that's how data is isolated between tenants and properties.

```
Tenant (chain)
 └── Property (hotel)            ← all operational data scoped here
      ├── RoomType ── Room
      ├── Guest ── GuestPreference / LoyaltyTransaction
      ├── RatePlan ── RatePlanItem (per room-type, per date)
      ├── Reservation ── ReservationExtra / Payment / Folio ── FolioCharge
      ├── HousekeepingTask
      ├── MaintenanceTicket
      ├── AIAlert
      └── AuditLog
 └── User (staff)                ← scoped to tenant, optionally to one property
```

### Entity relationship summary

| Parent | Child | Cardinality | On delete |
|---|---|---|---|
| tenants | properties | 1 → N | RESTRICT |
| tenants | users | 1 → N | RESTRICT |
| properties | users | 1 → N (optional) | SET NULL |
| properties | room_types, rooms, guests, reservations, rate_plans, hk_tasks, maintenance, ai_alerts, audit_logs | 1 → N | RESTRICT |
| room_types | rooms | 1 → N | RESTRICT |
| guests | guest_preferences | 1 → 1 | **CASCADE** |
| guests | loyalty_transactions | 1 → N | RESTRICT |
| rate_plans | rate_plan_items | 1 → N | RESTRICT |
| room_types | rate_plan_items | 1 → N | RESTRICT |
| reservations | reservation_extras, payments | 1 → N | RESTRICT |
| reservations | folios | 1 → 1 | RESTRICT |
| folios | folio_charges | 1 → N | RESTRICT |
| rooms | reservations, hk_tasks, maintenance | 1 → N | SET NULL / RESTRICT |
| users | hk_tasks, maintenance (assignee) | 1 → N (optional) | SET NULL |

---

## 3. Type conventions (Prisma → PostgreSQL)

| Prisma | PostgreSQL | Notes |
|---|---|---|
| `String @id @default(uuid())` | `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text` | App supplies UUID; DB default is a fallback |
| `String` / `String?` | `TEXT` / `TEXT NULL` | |
| `String[]` | `TEXT[] NOT NULL DEFAULT '{}'` | Native Postgres array |
| `Int` | `INTEGER` | |
| `Decimal @db.Decimal(10,2)` | `DECIMAL(10,2)` | Money |
| `Boolean` | `BOOLEAN` | |
| `DateTime` | `TIMESTAMP(3)` | millisecond precision |
| `DateTime @db.Date` | `DATE` | check-in/out, rate dates |
| `Json` | `JSONB` | alert metadata, audit before/after |
| `enum X` | `CREATE TYPE "X" AS ENUM (…)` | 14 enum types |

Column names are **quoted camelCase** (`"tenantId"`, `"createdAt"`) and table names are **snake_case plural** (`room_types`) — exactly what Prisma's `@@map` produces.

---

## 4. Table reference

### `tenants`
Top-level account (a hotel company/chain). Keys: `slug` unique.

### `properties`
A single hotel under a tenant. Holds locale config (`timezone`, `currency`, `gstNumber`), `totalRooms`, and default `checkInTime`/`checkOutTime`.

### `users`
Staff accounts. `role` (enum `UserRole`), `password` (bcrypt), `refreshToken` (hashed). `email` unique. Optional `propertyId` (a chain GM may span properties).

### `room_types`
Sellable category (Standard/Deluxe/Club/Suite). `baseRate`, `totalCount` (inventory used by the availability engine), `amenities[]`. Unique on `(propertyId, code)`.

### `rooms`
Physical rooms. `status` (enum `RoomStatus`: CLEAN/DIRTY/CLEANING/INSPECTING/MAINTENANCE/BLOCKED/OUT_OF_ORDER), `floor`, block flags. Unique on `(propertyId, number)`.

### `guests`
Guest CRM profile. Loyalty (`loyaltyTier`, `loyaltyPoints`), lifetime stats (`totalStays`, `totalNights`, `lifetimeValue`), `isVip`, `tags[]`.

### `guest_preferences`
1:1 with guest (cascade delete). Pillow/floor/dietary/early-late preferences.

### `loyalty_transactions`
Points ledger. `type` = EARN | REDEEM | EXPIRE | ADJUST.

### `rate_plans` / `rate_plan_items`
A plan (BAR/Corporate/OTA…) and its **price per room-type per date**. Unique on `(ratePlanId, roomTypeId, date)` — the cell behind the Revenue rate grid.

### `reservations`
The core booking. Money breakdown (`subTotal`, `taxAmount` = 18% GST, `totalAmount`, `paidAmount`, `balanceDue`), `status` (enum), `channel` (enum), lifecycle timestamps (`checkedInAt`, `checkedOutAt`, `cancelledAt`, `noShowAt`). `confirmationNumber` unique. Indexed by `(propertyId, status)`, `(propertyId, checkIn)`, `(propertyId, checkOut)`.

### `reservation_extras`
Add-ons (breakfast, airport pickup) — line items priced × quantity.

### `payments`
Money received against a reservation. `method` + `status` enums.

### `folios` / `folio_charges`
The guest bill (1:1 with reservation) and its individual charges by `department`.

### `housekeeping_tasks`
Cleaning jobs. `taskType`, `priority`, `status` enums; `assignedToId` → user; `nextCheckInTime` drives AI prioritisation. Indexed by `(propertyId, scheduledDate)` and `(propertyId, status)`.

### `maintenance_tickets`
Work orders. Priority/status enums, optional room, cost tracking.

### `ai_alerts`
Proactive AI insights surfaced on the dashboard. `severity` enum, `metadata` JSONB.

### `audit_logs`
Immutable change log written by the audit interceptor on every write. `beforeState`/`afterState` JSONB.

---

## 5. Common operational queries

> Replace `:pid` with a property id, e.g. `'prop_grand_meridian'`.

### Availability — rooms left to sell for a date range
```sql
SELECT rt."name",
       rt."totalCount"
       - COUNT(r."id") FILTER (
           WHERE r."status" IN ('CONFIRMED','CHECKED_IN')
             AND r."checkIn" < DATE '2026-06-15'
             AND r."checkOut" > DATE '2026-06-12'
         ) AS available
FROM "room_types" rt
LEFT JOIN "reservations" r ON r."roomTypeId" = rt."id"
WHERE rt."propertyId" = :pid AND rt."isActive"
GROUP BY rt."id", rt."name", rt."totalCount"
ORDER BY rt."sortOrder";
```

### Today's dashboard KPIs
```sql
-- In-house guests
SELECT COUNT(*) FROM "reservations"
WHERE "propertyId" = :pid AND "status" = 'CHECKED_IN';

-- Arrivals today
SELECT COUNT(*) FROM "reservations"
WHERE "propertyId" = :pid AND "checkIn" = CURRENT_DATE
  AND "status" IN ('CONFIRMED','CHECKED_IN');

-- Departures today
SELECT COUNT(*) FROM "reservations"
WHERE "propertyId" = :pid AND "checkOut" = CURRENT_DATE
  AND "status" IN ('CHECKED_IN','CHECKED_OUT');

-- Revenue collected today
SELECT COALESCE(SUM(p."amount"), 0) AS revenue_today
FROM "payments" p
JOIN "reservations" r ON r."id" = p."reservationId"
WHERE r."propertyId" = :pid
  AND p."status" = 'PAID'
  AND p."createdAt"::date = CURRENT_DATE;
```

### Occupancy %, ADR, RevPAR (today)
```sql
WITH stats AS (
  SELECT
    (SELECT "totalRooms" FROM "properties" WHERE "id" = :pid) AS total_rooms,
    COUNT(*) FILTER (WHERE "status" = 'CHECKED_IN')           AS sold,
    COALESCE(SUM("ratePerNight") FILTER (WHERE "status" = 'CHECKED_IN'), 0) AS room_revenue
  FROM "reservations"
  WHERE "propertyId" = :pid
)
SELECT
  ROUND(sold * 100.0 / NULLIF(total_rooms,0), 1)        AS occupancy_pct,
  ROUND(room_revenue / NULLIF(sold,0), 2)               AS adr,
  ROUND(room_revenue / NULLIF(total_rooms,0), 2)        AS revpar
FROM stats;
```

### Today's arrivals list (front desk)
```sql
SELECT r."confirmationNumber", g."firstName" || ' ' || g."lastName" AS guest,
       rt."name" AS room_type, rm."number" AS room, r."nights", r."totalAmount", r."status"
FROM "reservations" r
JOIN "guests" g       ON g."id"  = r."guestId"
JOIN "room_types" rt  ON rt."id" = r."roomTypeId"
LEFT JOIN "rooms" rm  ON rm."id" = r."roomId"
WHERE r."propertyId" = :pid AND r."checkIn" = CURRENT_DATE
ORDER BY r."status", guest;
```

### Housekeeping board (today, grouped by status)
```sql
SELECT t."status", rm."number", rm."floor", t."taskType", t."priority",
       u."firstName" AS assignee, t."nextCheckInTime"
FROM "housekeeping_tasks" t
JOIN "rooms" rm  ON rm."id" = t."roomId"
LEFT JOIN "users" u ON u."id" = t."assignedToId"
WHERE t."propertyId" = :pid AND t."scheduledDate" = CURRENT_DATE
ORDER BY t."status",
         array_position(ARRAY['URGENT','HIGH','NORMAL','LOW']::"TaskPriority"[], t."priority");
```

### Rate grid — next 14 days for one room type
```sql
SELECT i."date", i."ratePerNight", i."isLocked"
FROM "rate_plan_items" i
JOIN "rate_plans" p ON p."id" = i."ratePlanId"
WHERE p."propertyId" = :pid
  AND i."roomTypeId" = 'rt_dlx'
  AND i."date" BETWEEN CURRENT_DATE AND CURRENT_DATE + 13
ORDER BY i."date";
```

### Channel mix (last 30 days)
```sql
SELECT "channel", COUNT(*) AS bookings, SUM("totalAmount") AS revenue
FROM "reservations"
WHERE "propertyId" = :pid
  AND "createdAt" >= CURRENT_DATE - 30
  AND "status" <> 'CANCELLED'
GROUP BY "channel"
ORDER BY revenue DESC;
```

### Top guests by lifetime value
```sql
SELECT "firstName" || ' ' || "lastName" AS guest, "loyaltyTier",
       "totalStays", "lifetimeValue"
FROM "guests"
WHERE "propertyId" = :pid
ORDER BY "lifetimeValue" DESC
LIMIT 10;
```

### Room status snapshot
```sql
SELECT "status", COUNT(*) FROM "rooms"
WHERE "propertyId" = :pid
GROUP BY "status";
```

---

## 6. Keeping SQL ↔ Prisma in sync

This SQL and `schema.prisma` describe the **same** database. If you change one, update the other:

- **Schema-first (this file is source of truth):** edit the `.sql`, re-import, then run `npx prisma db pull` to refresh `schema.prisma` from the live DB.
- **Prisma-first (recommended long-term):** edit `schema.prisma`, run `npx prisma migrate dev`, then regenerate this `.sql` from the new migration in `backend/prisma/migrations/`.

For production, prefer Prisma migrations so changes are versioned and repeatable. This handcrafted SQL exists so you can stand up the database **now** without the migration toolchain.

---

## 7. Reset / drop

```sql
-- Wipe everything (tables + enum types) and start over
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- then re-run schema.postgres.sql
```
