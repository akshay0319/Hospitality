-- ═══════════════════════════════════════════════════════════════════════════════
--  HospitalityOS AI — PostgreSQL Schema (DDL)
--  Faithful 1:1 port of prisma/schema.prisma — table & column names match the
--  Prisma client exactly (snake_case tables via @@map, camelCase quoted columns).
--
--  Import:
--    createdb hospitality_os
--    psql -d hospitality_os -f database/schema.postgres.sql
--  (or paste into pgAdmin → Query Tool against the hospitality_os database)
--
--  Requires PostgreSQL 13+ (uses gen_random_uuid()).
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- gen_random_uuid() is built in to PG13+; pgcrypto kept as a fallback for older servers.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
--  ENUM TYPES (14)  — names match Prisma enum names exactly
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM (
  'OWNER', 'GENERAL_MANAGER', 'REVENUE_MANAGER', 'FRONT_DESK',
  'HOUSEKEEPING_SUPERVISOR', 'HOUSEKEEPER', 'MAINTENANCE', 'FINANCE'
);

CREATE TYPE "RoomStatus" AS ENUM (
  'CLEAN', 'DIRTY', 'CLEANING', 'INSPECTING', 'MAINTENANCE', 'BLOCKED', 'OUT_OF_ORDER'
);

CREATE TYPE "ReservationStatus" AS ENUM (
  'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'
);

CREATE TYPE "BookingChannel" AS ENUM (
  'DIRECT', 'BOOKING_COM', 'AIRBNB', 'EXPEDIA', 'AGODA',
  'MAKEMYTRIP', 'GOIBIBO', 'PHONE', 'WALK_IN', 'OTHER'
);

CREATE TYPE "LoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

CREATE TYPE "TaskStatus" AS ENUM (
  'PENDING', 'IN_PROGRESS', 'INSPECTING', 'COMPLETED', 'SKIPPED'
);

CREATE TYPE "TaskType" AS ENUM (
  'FULL_CLEAN', 'STAYOVER', 'TURNDOWN', 'DEEP_CLEAN', 'INSPECTION', 'MAINTENANCE'
);

CREATE TYPE "TaskPriority" AS ENUM ('URGENT', 'HIGH', 'NORMAL', 'LOW');

CREATE TYPE "MaintenanceStatus" AS ENUM (
  'OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'
);

CREATE TYPE "MaintenancePriority" AS ENUM ('CRITICAL', 'HIGH', 'NORMAL', 'LOW');

CREATE TYPE "RatePlanType" AS ENUM (
  'BAR', 'CORPORATE', 'OTA', 'PACKAGE', 'GROUP', 'PROMOTIONAL'
);

CREATE TYPE "PaymentMethod" AS ENUM (
  'CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CORPORATE_CREDIT', 'OTA_COLLECT'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING', 'PAID', 'PARTIAL', 'REFUNDED', 'FAILED'
);

CREATE TYPE "AlertSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- ─────────────────────────────────────────────────────────────────────────────
--  updatedAt trigger helper
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═════════════════════════════════════════════════════════════════════════════
--  TABLES
-- ═════════════════════════════════════════════════════════════════════════════

-- ── tenants ──────────────────────────────────────────────────────────────────
CREATE TABLE "tenants" (
  "id"        TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"      TEXT        NOT NULL,
  "slug"      TEXT        NOT NULL,
  "plan"      TEXT        NOT NULL DEFAULT 'starter',
  "isActive"  BOOLEAN     NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tenants_slug_key" UNIQUE ("slug")
);

-- ── properties ───────────────────────────────────────────────────────────────
CREATE TABLE "properties" (
  "id"           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId"     TEXT        NOT NULL,
  "name"         TEXT        NOT NULL,
  "brand"        TEXT,
  "chain"        TEXT,
  "starRating"   INTEGER     NOT NULL DEFAULT 3,
  "address"      TEXT        NOT NULL,
  "city"         TEXT        NOT NULL,
  "state"        TEXT,
  "country"      TEXT        NOT NULL DEFAULT 'India',
  "pincode"      TEXT,
  "phone"        TEXT,
  "email"        TEXT,
  "website"      TEXT,
  "timezone"     TEXT        NOT NULL DEFAULT 'Asia/Kolkata',
  "currency"     TEXT        NOT NULL DEFAULT 'INR',
  "gstNumber"    TEXT,
  "logoUrl"      TEXT,
  "totalRooms"   INTEGER     NOT NULL DEFAULT 0,
  "checkInTime"  TEXT        NOT NULL DEFAULT '14:00',
  "checkOutTime" TEXT        NOT NULL DEFAULT '12:00',
  "isActive"     BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "properties_tenantId_fkey" FOREIGN KEY ("tenantId")
    REFERENCES "tenants"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── users ────────────────────────────────────────────────────────────────────
CREATE TABLE "users" (
  "id"           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId"     TEXT        NOT NULL,
  "propertyId"   TEXT,
  "email"        TEXT        NOT NULL,
  "password"     TEXT        NOT NULL,
  "firstName"    TEXT        NOT NULL,
  "lastName"     TEXT        NOT NULL,
  "phone"        TEXT,
  "role"         "UserRole"  NOT NULL DEFAULT 'FRONT_DESK',
  "department"   TEXT,
  "isActive"     BOOLEAN     NOT NULL DEFAULT true,
  "lastLoginAt"  TIMESTAMP(3),
  "refreshToken" TEXT,
  "avatarUrl"    TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_email_key" UNIQUE ("email"),
  CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId")
    REFERENCES "tenants"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "users_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

-- ── room_types ───────────────────────────────────────────────────────────────
CREATE TABLE "room_types" (
  "id"           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"   TEXT        NOT NULL,
  "name"         TEXT        NOT NULL,
  "code"         TEXT        NOT NULL,
  "description"  TEXT,
  "maxOccupancy" INTEGER     NOT NULL DEFAULT 2,
  "maxAdults"    INTEGER     NOT NULL DEFAULT 2,
  "maxChildren"  INTEGER     NOT NULL DEFAULT 1,
  "baseRate"     DECIMAL(10,2) NOT NULL,
  "totalCount"   INTEGER     NOT NULL DEFAULT 0,
  "amenities"    TEXT[]      NOT NULL DEFAULT '{}',
  "imageUrls"    TEXT[]      NOT NULL DEFAULT '{}',
  "isActive"     BOOLEAN     NOT NULL DEFAULT true,
  "sortOrder"    INTEGER     NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "room_types_propertyId_code_key" UNIQUE ("propertyId", "code"),
  CONSTRAINT "room_types_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── rooms ────────────────────────────────────────────────────────────────────
CREATE TABLE "rooms" (
  "id"           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"   TEXT        NOT NULL,
  "roomTypeId"   TEXT        NOT NULL,
  "number"       TEXT        NOT NULL,
  "floor"        INTEGER     NOT NULL,
  "status"       "RoomStatus" NOT NULL DEFAULT 'DIRTY',
  "isBlocked"    BOOLEAN     NOT NULL DEFAULT false,
  "blockReason"  TEXT,
  "blockedUntil" TIMESTAMP(3),
  "features"     TEXT[]      NOT NULL DEFAULT '{}',
  "notes"        TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rooms_propertyId_number_key" UNIQUE ("propertyId", "number"),
  CONSTRAINT "rooms_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "rooms_roomTypeId_fkey" FOREIGN KEY ("roomTypeId")
    REFERENCES "room_types"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── guests ───────────────────────────────────────────────────────────────────
CREATE TABLE "guests" (
  "id"             TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"     TEXT        NOT NULL,
  "firstName"      TEXT        NOT NULL,
  "lastName"       TEXT        NOT NULL,
  "email"          TEXT,
  "phone"          TEXT,
  "nationality"    TEXT,
  "dateOfBirth"    TIMESTAMP(3),
  "idType"         TEXT,
  "idNumber"       TEXT,
  "idDocumentUrl"  TEXT,
  "loyaltyTier"    "LoyaltyTier" NOT NULL DEFAULT 'BRONZE',
  "loyaltyPoints"  INTEGER     NOT NULL DEFAULT 0,
  "totalStays"     INTEGER     NOT NULL DEFAULT 0,
  "totalNights"    INTEGER     NOT NULL DEFAULT 0,
  "lifetimeValue"  DECIMAL(12,2) NOT NULL DEFAULT 0,
  "language"       TEXT        NOT NULL DEFAULT 'en',
  "tags"           TEXT[]      NOT NULL DEFAULT '{}',
  "notes"          TEXT,
  "doNotDisturb"   BOOLEAN     NOT NULL DEFAULT false,
  "marketingOptIn" BOOLEAN     NOT NULL DEFAULT true,
  "isVip"          BOOLEAN     NOT NULL DEFAULT false,
  "lastStayAt"     TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "guests_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── guest_preferences ────────────────────────────────────────────────────────
CREATE TABLE "guest_preferences" (
  "id"                   TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "guestId"              TEXT    NOT NULL,
  "preferredRoomType"    TEXT,
  "preferredFloor"       TEXT,
  "pillowType"           TEXT,
  "dietaryRestrictions"  TEXT[]  NOT NULL DEFAULT '{}',
  "smokingRoom"          BOOLEAN NOT NULL DEFAULT false,
  "extraBed"             BOOLEAN NOT NULL DEFAULT false,
  "earlyCheckIn"         BOOLEAN NOT NULL DEFAULT false,
  "lateCheckOut"         BOOLEAN NOT NULL DEFAULT false,
  "noDisturbBefore"      TEXT,
  "noDisturbAfter"       TEXT,
  "communicationChannel" TEXT    NOT NULL DEFAULT 'email',
  "spokenLanguages"      TEXT[]  NOT NULL DEFAULT '{}',
  CONSTRAINT "guest_preferences_guestId_key" UNIQUE ("guestId"),
  CONSTRAINT "guest_preferences_guestId_fkey" FOREIGN KEY ("guestId")
    REFERENCES "guests"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- ── loyalty_transactions ─────────────────────────────────────────────────────
CREATE TABLE "loyalty_transactions" (
  "id"          TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "guestId"     TEXT    NOT NULL,
  "points"      INTEGER NOT NULL,
  "type"        TEXT    NOT NULL,   -- EARN | REDEEM | EXPIRE | ADJUST
  "description" TEXT    NOT NULL,
  "referenceId" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "loyalty_transactions_guestId_fkey" FOREIGN KEY ("guestId")
    REFERENCES "guests"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── rate_plans ───────────────────────────────────────────────────────────────
CREATE TABLE "rate_plans" (
  "id"          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"  TEXT        NOT NULL,
  "name"        TEXT        NOT NULL,
  "code"        TEXT        NOT NULL,
  "type"        "RatePlanType" NOT NULL DEFAULT 'BAR',
  "description" TEXT,
  "minStay"     INTEGER,
  "maxStay"     INTEGER,
  "isActive"    BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rate_plans_propertyId_code_key" UNIQUE ("propertyId", "code"),
  CONSTRAINT "rate_plans_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── rate_plan_items ──────────────────────────────────────────────────────────
CREATE TABLE "rate_plan_items" (
  "id"           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ratePlanId"   TEXT        NOT NULL,
  "roomTypeId"   TEXT        NOT NULL,
  "date"         DATE        NOT NULL,
  "ratePerNight" DECIMAL(10,2) NOT NULL,
  "isLocked"     BOOLEAN     NOT NULL DEFAULT false,
  "lockedAt"     TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rate_plan_items_ratePlanId_roomTypeId_date_key" UNIQUE ("ratePlanId", "roomTypeId", "date"),
  CONSTRAINT "rate_plan_items_ratePlanId_fkey" FOREIGN KEY ("ratePlanId")
    REFERENCES "rate_plans"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "rate_plan_items_roomTypeId_fkey" FOREIGN KEY ("roomTypeId")
    REFERENCES "room_types"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── reservations ─────────────────────────────────────────────────────────────
CREATE TABLE "reservations" (
  "id"                 TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "confirmationNumber" TEXT        NOT NULL,
  "propertyId"         TEXT        NOT NULL,
  "guestId"            TEXT        NOT NULL,
  "roomId"             TEXT,
  "roomTypeId"         TEXT        NOT NULL,
  "ratePlanId"         TEXT        NOT NULL,
  "checkIn"            DATE        NOT NULL,
  "checkOut"           DATE        NOT NULL,
  "nights"             INTEGER     NOT NULL,
  "adults"             INTEGER     NOT NULL DEFAULT 1,
  "children"           INTEGER     NOT NULL DEFAULT 0,
  "ratePerNight"       DECIMAL(10,2) NOT NULL,
  "subTotal"           DECIMAL(10,2) NOT NULL,
  "taxAmount"          DECIMAL(10,2) NOT NULL,
  "totalAmount"        DECIMAL(10,2) NOT NULL,
  "paidAmount"         DECIMAL(10,2) NOT NULL DEFAULT 0,
  "balanceDue"         DECIMAL(10,2) NOT NULL,
  "status"             "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
  "channel"            "BookingChannel"    NOT NULL DEFAULT 'DIRECT',
  "otaConfirmationNo"  TEXT,
  "specialRequests"    TEXT,
  "internalNotes"      TEXT,
  "checkedInAt"        TIMESTAMP(3),
  "checkedOutAt"       TIMESTAMP(3),
  "cancelledAt"        TIMESTAMP(3),
  "cancellationReason" TEXT,
  "noShowAt"           TIMESTAMP(3),
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reservations_confirmationNumber_key" UNIQUE ("confirmationNumber"),
  CONSTRAINT "reservations_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "reservations_guestId_fkey" FOREIGN KEY ("guestId")
    REFERENCES "guests"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "reservations_roomId_fkey" FOREIGN KEY ("roomId")
    REFERENCES "rooms"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "reservations_roomTypeId_fkey" FOREIGN KEY ("roomTypeId")
    REFERENCES "room_types"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "reservations_ratePlanId_fkey" FOREIGN KEY ("ratePlanId")
    REFERENCES "rate_plans"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── reservation_extras ───────────────────────────────────────────────────────
CREATE TABLE "reservation_extras" (
  "id"            TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "reservationId" TEXT    NOT NULL,
  "name"          TEXT    NOT NULL,
  "description"   TEXT,
  "price"         DECIMAL(10,2) NOT NULL,
  "quantity"      INTEGER NOT NULL DEFAULT 1,
  "totalPrice"    DECIMAL(10,2) NOT NULL,
  CONSTRAINT "reservation_extras_reservationId_fkey" FOREIGN KEY ("reservationId")
    REFERENCES "reservations"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── payments ─────────────────────────────────────────────────────────────────
CREATE TABLE "payments" (
  "id"            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "reservationId" TEXT        NOT NULL,
  "amount"        DECIMAL(10,2) NOT NULL,
  "method"        "PaymentMethod" NOT NULL,
  "status"        "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "reference"     TEXT,
  "notes"         TEXT,
  "processedAt"   TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payments_reservationId_fkey" FOREIGN KEY ("reservationId")
    REFERENCES "reservations"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── folios ───────────────────────────────────────────────────────────────────
CREATE TABLE "folios" (
  "id"            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "reservationId" TEXT        NOT NULL,
  "totalCharges"  DECIMAL(10,2) NOT NULL,
  "totalPayments" DECIMAL(10,2) NOT NULL,
  "balance"       DECIMAL(10,2) NOT NULL,
  "isClosed"      BOOLEAN     NOT NULL DEFAULT false,
  "closedAt"      TIMESTAMP(3),
  "invoiceNo"     TEXT,
  "invoiceUrl"    TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "folios_reservationId_key" UNIQUE ("reservationId"),
  CONSTRAINT "folios_reservationId_fkey" FOREIGN KEY ("reservationId")
    REFERENCES "reservations"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── folio_charges ────────────────────────────────────────────────────────────
CREATE TABLE "folio_charges" (
  "id"          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "folioId"     TEXT        NOT NULL,
  "description" TEXT        NOT NULL,
  "amount"      DECIMAL(10,2) NOT NULL,
  "quantity"    INTEGER     NOT NULL DEFAULT 1,
  "chargedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "department"  TEXT        NOT NULL DEFAULT 'ROOMS',
  CONSTRAINT "folio_charges_folioId_fkey" FOREIGN KEY ("folioId")
    REFERENCES "folios"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── housekeeping_tasks ───────────────────────────────────────────────────────
CREATE TABLE "housekeeping_tasks" (
  "id"               TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"       TEXT        NOT NULL,
  "roomId"           TEXT        NOT NULL,
  "taskType"         "TaskType"  NOT NULL,
  "priority"         "TaskPriority" NOT NULL DEFAULT 'NORMAL',
  "status"           "TaskStatus"   NOT NULL DEFAULT 'PENDING',
  "assignedToId"     TEXT,
  "estimatedMinutes" INTEGER     NOT NULL DEFAULT 30,
  "startedAt"        TIMESTAMP(3),
  "completedAt"      TIMESTAMP(3),
  "nextCheckInTime"  TIMESTAMP(3),
  "notes"            TEXT,
  "photoUrls"        TEXT[]      NOT NULL DEFAULT '{}',
  "supervisorNotes"  TEXT,
  "scheduledDate"    DATE        NOT NULL,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "housekeeping_tasks_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "housekeeping_tasks_roomId_fkey" FOREIGN KEY ("roomId")
    REFERENCES "rooms"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "housekeeping_tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId")
    REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

-- ── maintenance_tickets ──────────────────────────────────────────────────────
CREATE TABLE "maintenance_tickets" (
  "id"            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"    TEXT        NOT NULL,
  "roomId"        TEXT,
  "title"         TEXT        NOT NULL,
  "description"   TEXT        NOT NULL,
  "priority"      "MaintenancePriority" NOT NULL DEFAULT 'NORMAL',
  "status"        "MaintenanceStatus"   NOT NULL DEFAULT 'OPEN',
  "assignedToId"  TEXT,
  "reportedById"  TEXT,
  "category"      TEXT,
  "estimatedCost" DECIMAL(10,2),
  "actualCost"    DECIMAL(10,2),
  "photoUrls"     TEXT[]      NOT NULL DEFAULT '{}',
  "resolvedAt"    TIMESTAMP(3),
  "dueDate"       TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "maintenance_tickets_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "maintenance_tickets_roomId_fkey" FOREIGN KEY ("roomId")
    REFERENCES "rooms"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "maintenance_tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId")
    REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

-- ── ai_alerts ────────────────────────────────────────────────────────────────
CREATE TABLE "ai_alerts" (
  "id"          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"  TEXT        NOT NULL,
  "title"       TEXT        NOT NULL,
  "description" TEXT        NOT NULL,
  "severity"    "AlertSeverity" NOT NULL,
  "module"      TEXT        NOT NULL,
  "isRead"      BOOLEAN     NOT NULL DEFAULT false,
  "readAt"      TIMESTAMP(3),
  "actionUrl"   TEXT,
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_alerts_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ── audit_logs ───────────────────────────────────────────────────────────────
CREATE TABLE "audit_logs" (
  "id"          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"  TEXT        NOT NULL,
  "userId"      TEXT,
  "action"      TEXT        NOT NULL,
  "entity"      TEXT        NOT NULL,
  "entityId"    TEXT,
  "beforeState" JSONB,
  "afterState"  JSONB,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_propertyId_fkey" FOREIGN KEY ("propertyId")
    REFERENCES "properties"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

-- ═════════════════════════════════════════════════════════════════════════════
--  INDEXES  (mirror Prisma @@index)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE INDEX "reservations_propertyId_status_idx"     ON "reservations" ("propertyId", "status");
CREATE INDEX "reservations_propertyId_checkIn_idx"     ON "reservations" ("propertyId", "checkIn");
CREATE INDEX "reservations_propertyId_checkOut_idx"    ON "reservations" ("propertyId", "checkOut");

CREATE INDEX "housekeeping_tasks_propertyId_scheduledDate_idx" ON "housekeeping_tasks" ("propertyId", "scheduledDate");
CREATE INDEX "housekeeping_tasks_propertyId_status_idx"        ON "housekeeping_tasks" ("propertyId", "status");

CREATE INDEX "maintenance_tickets_propertyId_status_idx" ON "maintenance_tickets" ("propertyId", "status");

CREATE INDEX "ai_alerts_propertyId_isRead_idx" ON "ai_alerts" ("propertyId", "isRead");

CREATE INDEX "audit_logs_propertyId_entity_idx"    ON "audit_logs" ("propertyId", "entity");
CREATE INDEX "audit_logs_propertyId_createdAt_idx" ON "audit_logs" ("propertyId", "createdAt");

-- Helpful secondary indexes for common lookups (not in Prisma, but operationally useful)
CREATE INDEX "rooms_propertyId_status_idx"        ON "rooms" ("propertyId", "status");
CREATE INDEX "guests_propertyId_email_idx"        ON "guests" ("propertyId", "email");
CREATE INDEX "guests_propertyId_phone_idx"        ON "guests" ("propertyId", "phone");
CREATE INDEX "rate_plan_items_roomTypeId_date_idx" ON "rate_plan_items" ("roomTypeId", "date");
CREATE INDEX "payments_reservationId_idx"         ON "payments" ("reservationId");

-- ═════════════════════════════════════════════════════════════════════════════
--  TRIGGERS  — auto-bump "updatedAt" on UPDATE
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TRIGGER trg_tenants_updated    BEFORE UPDATE ON "tenants"    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON "properties" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated      BEFORE UPDATE ON "users"      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_room_types_updated BEFORE UPDATE ON "room_types" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_rooms_updated      BEFORE UPDATE ON "rooms"      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_guests_updated     BEFORE UPDATE ON "guests"     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_rate_plans_updated BEFORE UPDATE ON "rate_plans" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_rate_plan_items_updated BEFORE UPDATE ON "rate_plan_items" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON "reservations" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_folios_updated     BEFORE UPDATE ON "folios"     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_hk_tasks_updated   BEFORE UPDATE ON "housekeeping_tasks" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_maint_updated      BEFORE UPDATE ON "maintenance_tickets" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;

-- ✅ Schema ready. Next: import database/seed.postgres.sql for demo data.
