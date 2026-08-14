# HospitalityOS AI — MariaDB Setup (XAMPP)

This documents the **MariaDB** database that has been created and migrated on your local XAMPP server.

- **Server:** `127.0.0.1` · MariaDB **10.1.37** (XAMPP) · user `root` · no password
- **Database:** `hospitality`
- **Status:** ✅ migrated + seeded (19 tables, 19 auto-UUID triggers, demo data)
- **Files:** [`schema.mariadb.sql`](schema.mariadb.sql) · [`seed.mariadb.sql`](seed.mariadb.sql)

> For the PostgreSQL variant (matches the Prisma backend natively) see [`DATABASE.md`](DATABASE.md).

---

## 1. What was run

```bash
"C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/schema.mariadb.sql
"C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/seed.mariadb.sql
```

Verified after import:

| Table | Rows | Table | Rows |
|---|---|---|---|
| tenants | 1 | rate_plans | 2 |
| properties | 1 | reservations | 1 |
| users | 4 | folios | 1 |
| room_types | 4 | ai_alerts | 2 |
| rooms | 15 | guests | 3 |

**Demo logins** (password `demo1234` for all):

| Email | Role |
|---|---|
| `manager@grandmeridian.in` | General Manager |
| `frontdesk@grandmeridian.in` | Front Desk |
| `revenue@grandmeridian.in` | Revenue Manager |
| `housekeeping@grandmeridian.in` | Housekeeping Supervisor |

## 2. Re-run / reset

```bash
# Full rebuild (drops & recreates all tables, then reseeds)
"C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/schema.mariadb.sql
"C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/seed.mariadb.sql
```
Or in **phpMyAdmin** → select `Hospitality` → **Import** → choose the file → **Go**.

## 3. MariaDB 10.1 adaptations (vs the Prisma/PostgreSQL model)

MariaDB 10.1 is old (2018) and lacks several features, so this schema differs from the Prisma source:

| Prisma / PostgreSQL | MariaDB 10.1 mapping |
|---|---|
| `String[]` arrays (amenities, tags, features, imageUrls, photoUrls, dietaryRestrictions, spokenLanguages) | `LONGTEXT` holding a **JSON array string** e.g. `["WiFi","AC"]` |
| `Json` (alert metadata, audit before/after) | `LONGTEXT` holding a JSON string |
| enum types | inline column `ENUM(...)` |
| `gen_random_uuid()` default | `BEFORE INSERT` trigger calling `UUID()` when id is empty |
| `updatedAt` (Prisma-managed) | `DATETIME(3) ... ON UPDATE CURRENT_TIMESTAMP(3)` (DB-managed) |
| `TIMESTAMP(3)` | `DATETIME(3)` |
| ids `TEXT` | `VARCHAR(191)` (utf8mb4 index-safe length) |

Table & column names still match Prisma exactly (snake_case tables, camelCase columns).

## 4. Common queries (MariaDB dialect)

```sql
-- Availability for a date range (rooms left to sell per type)
SELECT rt.name,
       rt.totalCount - COUNT(CASE WHEN r.status IN ('CONFIRMED','CHECKED_IN')
             AND r.checkIn < '2026-07-30' AND r.checkOut > '2026-07-27'
             THEN 1 END) AS available
FROM room_types rt
LEFT JOIN reservations r ON r.roomTypeId = rt.id
WHERE rt.propertyId = 'prop_grand_meridian' AND rt.isActive = 1
GROUP BY rt.id, rt.name, rt.totalCount ORDER BY rt.sortOrder;

-- Today's KPIs
SELECT COUNT(*) AS in_house FROM reservations
WHERE propertyId='prop_grand_meridian' AND status='CHECKED_IN';

SELECT COUNT(*) AS arrivals_today FROM reservations
WHERE propertyId='prop_grand_meridian' AND checkIn=CURDATE()
  AND status IN ('CONFIRMED','CHECKED_IN');

-- Occupancy / ADR / RevPAR (today)
SELECT
  ROUND(SUM(status='CHECKED_IN') * 100.0 / p.totalRooms, 1) AS occupancy_pct,
  ROUND(SUM(CASE WHEN status='CHECKED_IN' THEN ratePerNight END) / NULLIF(SUM(status='CHECKED_IN'),0), 2) AS adr,
  ROUND(SUM(CASE WHEN status='CHECKED_IN' THEN ratePerNight END) / p.totalRooms, 2) AS revpar
FROM reservations r
JOIN properties p ON p.id = r.propertyId
WHERE r.propertyId='prop_grand_meridian';

-- Read a JSON-array column back as text (parse in app with JSON.parse)
SELECT name, amenities FROM room_types WHERE propertyId='prop_grand_meridian';

-- Room status snapshot
SELECT status, COUNT(*) FROM rooms
WHERE propertyId='prop_grand_meridian' GROUP BY status;
```

---

## 5. ⚠️ IMPORTANT — connecting the NestJS backend

The backend (`/backend`) uses **Prisma with `provider = "postgresql"`**. It will **not** connect to this MariaDB 10.1 database as-is. Three hard blockers:

1. **Provider mismatch** — Prisma is set to `postgresql`; it would need to be `mysql`.
2. **Scalar lists** — Prisma does **not** support `String[]` on MySQL/MariaDB. The 7 array fields would each need to become a `Json` field (or a related child table).
3. **Version floor** — Prisma's `Json` type needs **MySQL 5.7+ / MariaDB 10.2.7+**. This server is **10.1.37**, below that line.

### Your options

| Option | What it means | Effort |
|---|---|---|
| **A. Run the backend on PostgreSQL** (recommended) | Install PostgreSQL, import `schema.postgres.sql`. Backend works unchanged. This MariaDB DB stays as a reference/phpMyAdmin playground. | Low |
| **B. Upgrade MariaDB + adapt Prisma** | Upgrade XAMPP's MariaDB to **10.4+**, switch Prisma provider to `mysql`, convert the 7 `String[]` fields to `Json`, regenerate. | Medium |
| **C. Use this DB without Prisma** | Query it directly (phpMyAdmin, raw SQL, or a plain `mysql2` client) — no ORM. Backend would need rewriting off Prisma. | High |

**Recommendation:** the database is ready to explore in phpMyAdmin right now. But for the app's backend to actually talk to a database, go with **Option A (PostgreSQL)** — it's the least work and what the code already expects. If you specifically want everything on XAMPP/MariaDB, tell me and I'll do **Option B** (upgrade + Prisma conversion).
