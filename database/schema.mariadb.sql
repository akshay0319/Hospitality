-- ═══════════════════════════════════════════════════════════════════════════════
--  HospitalityOS AI — MariaDB / MySQL Schema (DDL)
--  Target: MariaDB 10.1.37 (XAMPP)  ·  Engine: InnoDB  ·  Charset: utf8mb4
--
--  Table & column names match prisma/schema.prisma (snake_case tables,
--  camelCase columns). Adaptations for MariaDB 10.1:
--    • PostgreSQL arrays (String[])  → LONGTEXT holding a JSON array string
--    • PostgreSQL Json               → LONGTEXT holding a JSON string
--    • enum types                    → inline column ENUM(...)
--    • gen_random_uuid()             → BEFORE INSERT trigger calling UUID()
--    • updatedAt                     → DATETIME(3) ON UPDATE CURRENT_TIMESTAMP(3)
--
--  Import:
--    "C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/schema.mariadb.sql
--    (or phpMyAdmin → Hospitality → Import → choose this file)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS `hospitality`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hospitality`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `ai_alerts`;
DROP TABLE IF EXISTS `maintenance_tickets`;
DROP TABLE IF EXISTS `housekeeping_tasks`;
DROP TABLE IF EXISTS `folio_charges`;
DROP TABLE IF EXISTS `folios`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `reservation_extras`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `rate_plan_items`;
DROP TABLE IF EXISTS `rate_plans`;
DROP TABLE IF EXISTS `loyalty_transactions`;
DROP TABLE IF EXISTS `guest_preferences`;
DROP TABLE IF EXISTS `guests`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `room_types`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `properties`;
DROP TABLE IF EXISTS `tenants`;

SET FOREIGN_KEY_CHECKS = 1;

-- ── tenants ──────────────────────────────────────────────────────────────────
CREATE TABLE `tenants` (
  `id`        VARCHAR(191) NOT NULL,
  `name`      VARCHAR(191) NOT NULL,
  `slug`      VARCHAR(191) NOT NULL,
  `plan`      VARCHAR(191) NOT NULL DEFAULT 'starter',
  `isActive`  TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenants_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── properties ───────────────────────────────────────────────────────────────
CREATE TABLE `properties` (
  `id`           VARCHAR(191) NOT NULL,
  `tenantId`     VARCHAR(191) NOT NULL,
  `name`         VARCHAR(191) NOT NULL,
  `brand`        VARCHAR(191) NULL,
  `chain`        VARCHAR(191) NULL,
  `starRating`   INT          NOT NULL DEFAULT 3,
  `address`      TEXT         NOT NULL,
  `city`         VARCHAR(191) NOT NULL,
  `state`        VARCHAR(191) NULL,
  `country`      VARCHAR(191) NOT NULL DEFAULT 'India',
  `pincode`      VARCHAR(191) NULL,
  `phone`        VARCHAR(191) NULL,
  `email`        VARCHAR(191) NULL,
  `website`      VARCHAR(191) NULL,
  `timezone`     VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
  `currency`     VARCHAR(191) NOT NULL DEFAULT 'INR',
  `gstNumber`    VARCHAR(191) NULL,
  `logoUrl`      VARCHAR(191) NULL,
  `totalRooms`   INT          NOT NULL DEFAULT 0,
  `checkInTime`  VARCHAR(191) NOT NULL DEFAULT '14:00',
  `checkOutTime` VARCHAR(191) NOT NULL DEFAULT '12:00',
  `isActive`     TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `properties_tenantId_idx` (`tenantId`),
  CONSTRAINT `properties_tenantId_fkey` FOREIGN KEY (`tenantId`)
    REFERENCES `tenants` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── users ────────────────────────────────────────────────────────────────────
CREATE TABLE `users` (
  `id`           VARCHAR(191) NOT NULL,
  `tenantId`     VARCHAR(191) NOT NULL,
  `propertyId`   VARCHAR(191) NULL,
  `email`        VARCHAR(191) NOT NULL,
  `password`     VARCHAR(191) NOT NULL,
  `firstName`    VARCHAR(191) NOT NULL,
  `lastName`     VARCHAR(191) NOT NULL,
  `phone`        VARCHAR(191) NULL,
  `role`         ENUM('OWNER','GENERAL_MANAGER','REVENUE_MANAGER','FRONT_DESK','HOUSEKEEPING_SUPERVISOR','HOUSEKEEPER','MAINTENANCE','FINANCE') NOT NULL DEFAULT 'FRONT_DESK',
  `department`   VARCHAR(191) NULL,
  `isActive`     TINYINT(1)   NOT NULL DEFAULT 1,
  `lastLoginAt`  DATETIME(3)  NULL,
  `refreshToken` TEXT         NULL,
  `avatarUrl`    VARCHAR(191) NULL,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_tenantId_idx` (`tenantId`),
  KEY `users_propertyId_idx` (`propertyId`),
  CONSTRAINT `users_tenantId_fkey` FOREIGN KEY (`tenantId`)
    REFERENCES `tenants` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `users_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── room_types ───────────────────────────────────────────────────────────────
CREATE TABLE `room_types` (
  `id`           VARCHAR(191) NOT NULL,
  `propertyId`   VARCHAR(191) NOT NULL,
  `name`         VARCHAR(191) NOT NULL,
  `code`         VARCHAR(191) NOT NULL,
  `description`  TEXT         NULL,
  `maxOccupancy` INT          NOT NULL DEFAULT 2,
  `maxAdults`    INT          NOT NULL DEFAULT 2,
  `maxChildren`  INT          NOT NULL DEFAULT 1,
  `baseRate`     DECIMAL(10,2) NOT NULL,
  `totalCount`   INT          NOT NULL DEFAULT 0,
  `amenities`    LONGTEXT     NULL,  -- JSON array
  `imageUrls`    LONGTEXT     NULL,  -- JSON array
  `isActive`     TINYINT(1)   NOT NULL DEFAULT 1,
  `sortOrder`    INT          NOT NULL DEFAULT 0,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_types_propertyId_code_key` (`propertyId`, `code`),
  CONSTRAINT `room_types_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── rooms ────────────────────────────────────────────────────────────────────
CREATE TABLE `rooms` (
  `id`           VARCHAR(191) NOT NULL,
  `propertyId`   VARCHAR(191) NOT NULL,
  `roomTypeId`   VARCHAR(191) NOT NULL,
  `number`       VARCHAR(191) NOT NULL,
  `floor`        INT          NOT NULL,
  `status`       ENUM('CLEAN','DIRTY','CLEANING','INSPECTING','MAINTENANCE','BLOCKED','OUT_OF_ORDER') NOT NULL DEFAULT 'DIRTY',
  `isBlocked`    TINYINT(1)   NOT NULL DEFAULT 0,
  `blockReason`  TEXT         NULL,
  `blockedUntil` DATETIME(3)  NULL,
  `features`     LONGTEXT     NULL,  -- JSON array
  `notes`        TEXT         NULL,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_propertyId_number_key` (`propertyId`, `number`),
  KEY `rooms_roomTypeId_idx` (`roomTypeId`),
  KEY `rooms_propertyId_status_idx` (`propertyId`, `status`),
  CONSTRAINT `rooms_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `rooms_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`)
    REFERENCES `room_types` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── guests ───────────────────────────────────────────────────────────────────
CREATE TABLE `guests` (
  `id`             VARCHAR(191) NOT NULL,
  `propertyId`     VARCHAR(191) NOT NULL,
  `firstName`      VARCHAR(191) NOT NULL,
  `lastName`       VARCHAR(191) NOT NULL,
  `email`          VARCHAR(191) NULL,
  `phone`          VARCHAR(191) NULL,
  `nationality`    VARCHAR(191) NULL,
  `dateOfBirth`    DATETIME(3)  NULL,
  `idType`         VARCHAR(191) NULL,
  `idNumber`       VARCHAR(191) NULL,
  `idDocumentUrl`  VARCHAR(191) NULL,
  `loyaltyTier`    ENUM('BRONZE','SILVER','GOLD','PLATINUM') NOT NULL DEFAULT 'BRONZE',
  `loyaltyPoints`  INT          NOT NULL DEFAULT 0,
  `totalStays`     INT          NOT NULL DEFAULT 0,
  `totalNights`    INT          NOT NULL DEFAULT 0,
  `lifetimeValue`  DECIMAL(12,2) NOT NULL DEFAULT 0,
  `language`       VARCHAR(191) NOT NULL DEFAULT 'en',
  `tags`           LONGTEXT     NULL,  -- JSON array
  `notes`          TEXT         NULL,
  `doNotDisturb`   TINYINT(1)   NOT NULL DEFAULT 0,
  `marketingOptIn` TINYINT(1)   NOT NULL DEFAULT 1,
  `isVip`          TINYINT(1)   NOT NULL DEFAULT 0,
  `lastStayAt`     DATETIME(3)  NULL,
  `createdAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `guests_propertyId_email_idx` (`propertyId`, `email`),
  KEY `guests_propertyId_phone_idx` (`propertyId`, `phone`),
  CONSTRAINT `guests_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── guest_preferences ────────────────────────────────────────────────────────
CREATE TABLE `guest_preferences` (
  `id`                   VARCHAR(191) NOT NULL,
  `guestId`              VARCHAR(191) NOT NULL,
  `preferredRoomType`    VARCHAR(191) NULL,
  `preferredFloor`       VARCHAR(191) NULL,
  `pillowType`           VARCHAR(191) NULL,
  `dietaryRestrictions`  LONGTEXT     NULL,  -- JSON array
  `smokingRoom`          TINYINT(1)   NOT NULL DEFAULT 0,
  `extraBed`             TINYINT(1)   NOT NULL DEFAULT 0,
  `earlyCheckIn`         TINYINT(1)   NOT NULL DEFAULT 0,
  `lateCheckOut`         TINYINT(1)   NOT NULL DEFAULT 0,
  `noDisturbBefore`      VARCHAR(191) NULL,
  `noDisturbAfter`       VARCHAR(191) NULL,
  `communicationChannel` VARCHAR(191) NOT NULL DEFAULT 'email',
  `spokenLanguages`      LONGTEXT     NULL,  -- JSON array
  PRIMARY KEY (`id`),
  UNIQUE KEY `guest_preferences_guestId_key` (`guestId`),
  CONSTRAINT `guest_preferences_guestId_fkey` FOREIGN KEY (`guestId`)
    REFERENCES `guests` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── loyalty_transactions ─────────────────────────────────────────────────────
CREATE TABLE `loyalty_transactions` (
  `id`          VARCHAR(191) NOT NULL,
  `guestId`     VARCHAR(191) NOT NULL,
  `points`      INT          NOT NULL,
  `type`        VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NOT NULL,
  `referenceId` VARCHAR(191) NULL,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `loyalty_transactions_guestId_idx` (`guestId`),
  CONSTRAINT `loyalty_transactions_guestId_fkey` FOREIGN KEY (`guestId`)
    REFERENCES `guests` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── rate_plans ───────────────────────────────────────────────────────────────
CREATE TABLE `rate_plans` (
  `id`          VARCHAR(191) NOT NULL,
  `propertyId`  VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `code`        VARCHAR(191) NOT NULL,
  `type`        ENUM('BAR','CORPORATE','OTA','PACKAGE','GROUP','PROMOTIONAL') NOT NULL DEFAULT 'BAR',
  `description` TEXT         NULL,
  `minStay`     INT          NULL,
  `maxStay`     INT          NULL,
  `isActive`    TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rate_plans_propertyId_code_key` (`propertyId`, `code`),
  CONSTRAINT `rate_plans_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── rate_plan_items ──────────────────────────────────────────────────────────
CREATE TABLE `rate_plan_items` (
  `id`           VARCHAR(191) NOT NULL,
  `ratePlanId`   VARCHAR(191) NOT NULL,
  `roomTypeId`   VARCHAR(191) NOT NULL,
  `date`         DATE         NOT NULL,
  `ratePerNight` DECIMAL(10,2) NOT NULL,
  `isLocked`     TINYINT(1)   NOT NULL DEFAULT 0,
  `lockedAt`     DATETIME(3)  NULL,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rate_plan_items_ratePlanId_roomTypeId_date_key` (`ratePlanId`, `roomTypeId`, `date`),
  KEY `rate_plan_items_roomTypeId_date_idx` (`roomTypeId`, `date`),
  CONSTRAINT `rate_plan_items_ratePlanId_fkey` FOREIGN KEY (`ratePlanId`)
    REFERENCES `rate_plans` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `rate_plan_items_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`)
    REFERENCES `room_types` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── reservations ─────────────────────────────────────────────────────────────
CREATE TABLE `reservations` (
  `id`                 VARCHAR(191) NOT NULL,
  `confirmationNumber` VARCHAR(191) NOT NULL,
  `propertyId`         VARCHAR(191) NOT NULL,
  `guestId`            VARCHAR(191) NOT NULL,
  `roomId`             VARCHAR(191) NULL,
  `roomTypeId`         VARCHAR(191) NOT NULL,
  `ratePlanId`         VARCHAR(191) NOT NULL,
  `checkIn`            DATE         NOT NULL,
  `checkOut`           DATE         NOT NULL,
  `nights`             INT          NOT NULL,
  `adults`             INT          NOT NULL DEFAULT 1,
  `children`           INT          NOT NULL DEFAULT 0,
  `ratePerNight`       DECIMAL(10,2) NOT NULL,
  `subTotal`           DECIMAL(10,2) NOT NULL,
  `taxAmount`          DECIMAL(10,2) NOT NULL,
  `totalAmount`        DECIMAL(10,2) NOT NULL,
  `paidAmount`         DECIMAL(10,2) NOT NULL DEFAULT 0,
  `balanceDue`         DECIMAL(10,2) NOT NULL,
  `status`             ENUM('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'CONFIRMED',
  `channel`            ENUM('DIRECT','BOOKING_COM','AIRBNB','EXPEDIA','AGODA','MAKEMYTRIP','GOIBIBO','PHONE','WALK_IN','OTHER') NOT NULL DEFAULT 'DIRECT',
  `otaConfirmationNo`  VARCHAR(191) NULL,
  `specialRequests`    TEXT         NULL,
  `internalNotes`      TEXT         NULL,
  `checkedInAt`        DATETIME(3)  NULL,
  `checkedOutAt`       DATETIME(3)  NULL,
  `cancelledAt`        DATETIME(3)  NULL,
  `cancellationReason` TEXT         NULL,
  `noShowAt`           DATETIME(3)  NULL,
  `createdAt`          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservations_confirmationNumber_key` (`confirmationNumber`),
  KEY `reservations_propertyId_status_idx` (`propertyId`, `status`),
  KEY `reservations_propertyId_checkIn_idx` (`propertyId`, `checkIn`),
  KEY `reservations_propertyId_checkOut_idx` (`propertyId`, `checkOut`),
  KEY `reservations_guestId_idx` (`guestId`),
  KEY `reservations_roomId_idx` (`roomId`),
  KEY `reservations_roomTypeId_idx` (`roomTypeId`),
  KEY `reservations_ratePlanId_idx` (`ratePlanId`),
  CONSTRAINT `reservations_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `reservations_guestId_fkey` FOREIGN KEY (`guestId`)
    REFERENCES `guests` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `reservations_roomId_fkey` FOREIGN KEY (`roomId`)
    REFERENCES `rooms` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `reservations_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`)
    REFERENCES `room_types` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `reservations_ratePlanId_fkey` FOREIGN KEY (`ratePlanId`)
    REFERENCES `rate_plans` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── reservation_extras ───────────────────────────────────────────────────────
CREATE TABLE `reservation_extras` (
  `id`            VARCHAR(191) NOT NULL,
  `reservationId` VARCHAR(191) NOT NULL,
  `name`          VARCHAR(191) NOT NULL,
  `description`   TEXT         NULL,
  `price`         DECIMAL(10,2) NOT NULL,
  `quantity`      INT          NOT NULL DEFAULT 1,
  `totalPrice`    DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_extras_reservationId_idx` (`reservationId`),
  CONSTRAINT `reservation_extras_reservationId_fkey` FOREIGN KEY (`reservationId`)
    REFERENCES `reservations` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── payments ─────────────────────────────────────────────────────────────────
CREATE TABLE `payments` (
  `id`            VARCHAR(191) NOT NULL,
  `reservationId` VARCHAR(191) NOT NULL,
  `amount`        DECIMAL(10,2) NOT NULL,
  `method`        ENUM('CASH','CARD','UPI','BANK_TRANSFER','CORPORATE_CREDIT','OTA_COLLECT') NOT NULL,
  `status`        ENUM('PENDING','PAID','PARTIAL','REFUNDED','FAILED') NOT NULL DEFAULT 'PENDING',
  `reference`     VARCHAR(191) NULL,
  `notes`         TEXT         NULL,
  `processedAt`   DATETIME(3)  NULL,
  `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `payments_reservationId_idx` (`reservationId`),
  CONSTRAINT `payments_reservationId_fkey` FOREIGN KEY (`reservationId`)
    REFERENCES `reservations` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── folios ───────────────────────────────────────────────────────────────────
CREATE TABLE `folios` (
  `id`            VARCHAR(191) NOT NULL,
  `reservationId` VARCHAR(191) NOT NULL,
  `totalCharges`  DECIMAL(10,2) NOT NULL,
  `totalPayments` DECIMAL(10,2) NOT NULL,
  `balance`       DECIMAL(10,2) NOT NULL,
  `isClosed`      TINYINT(1)   NOT NULL DEFAULT 0,
  `closedAt`      DATETIME(3)  NULL,
  `invoiceNo`     VARCHAR(191) NULL,
  `invoiceUrl`    VARCHAR(191) NULL,
  `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `folios_reservationId_key` (`reservationId`),
  CONSTRAINT `folios_reservationId_fkey` FOREIGN KEY (`reservationId`)
    REFERENCES `reservations` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── folio_charges ────────────────────────────────────────────────────────────
CREATE TABLE `folio_charges` (
  `id`          VARCHAR(191) NOT NULL,
  `folioId`     VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NOT NULL,
  `amount`      DECIMAL(10,2) NOT NULL,
  `quantity`    INT          NOT NULL DEFAULT 1,
  `chargedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `department`  VARCHAR(191) NOT NULL DEFAULT 'ROOMS',
  PRIMARY KEY (`id`),
  KEY `folio_charges_folioId_idx` (`folioId`),
  CONSTRAINT `folio_charges_folioId_fkey` FOREIGN KEY (`folioId`)
    REFERENCES `folios` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── housekeeping_tasks ───────────────────────────────────────────────────────
CREATE TABLE `housekeeping_tasks` (
  `id`               VARCHAR(191) NOT NULL,
  `propertyId`       VARCHAR(191) NOT NULL,
  `roomId`           VARCHAR(191) NOT NULL,
  `taskType`         ENUM('FULL_CLEAN','STAYOVER','TURNDOWN','DEEP_CLEAN','INSPECTION','MAINTENANCE') NOT NULL,
  `priority`         ENUM('URGENT','HIGH','NORMAL','LOW') NOT NULL DEFAULT 'NORMAL',
  `status`           ENUM('PENDING','IN_PROGRESS','INSPECTING','COMPLETED','SKIPPED') NOT NULL DEFAULT 'PENDING',
  `assignedToId`     VARCHAR(191) NULL,
  `estimatedMinutes` INT          NOT NULL DEFAULT 30,
  `startedAt`        DATETIME(3)  NULL,
  `completedAt`      DATETIME(3)  NULL,
  `nextCheckInTime`  DATETIME(3)  NULL,
  `notes`            TEXT         NULL,
  `photoUrls`        LONGTEXT     NULL,  -- JSON array
  `supervisorNotes`  TEXT         NULL,
  `scheduledDate`    DATE         NOT NULL,
  `createdAt`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `housekeeping_tasks_propertyId_scheduledDate_idx` (`propertyId`, `scheduledDate`),
  KEY `housekeeping_tasks_propertyId_status_idx` (`propertyId`, `status`),
  KEY `housekeeping_tasks_roomId_idx` (`roomId`),
  KEY `housekeeping_tasks_assignedToId_idx` (`assignedToId`),
  CONSTRAINT `housekeeping_tasks_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `housekeeping_tasks_roomId_fkey` FOREIGN KEY (`roomId`)
    REFERENCES `rooms` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `housekeeping_tasks_assignedToId_fkey` FOREIGN KEY (`assignedToId`)
    REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── maintenance_tickets ──────────────────────────────────────────────────────
CREATE TABLE `maintenance_tickets` (
  `id`            VARCHAR(191) NOT NULL,
  `propertyId`    VARCHAR(191) NOT NULL,
  `roomId`        VARCHAR(191) NULL,
  `title`         VARCHAR(191) NOT NULL,
  `description`   TEXT         NOT NULL,
  `priority`      ENUM('CRITICAL','HIGH','NORMAL','LOW') NOT NULL DEFAULT 'NORMAL',
  `status`        ENUM('OPEN','IN_PROGRESS','ON_HOLD','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  `assignedToId`  VARCHAR(191) NULL,
  `reportedById`  VARCHAR(191) NULL,
  `category`      VARCHAR(191) NULL,
  `estimatedCost` DECIMAL(10,2) NULL,
  `actualCost`    DECIMAL(10,2) NULL,
  `photoUrls`     LONGTEXT     NULL,  -- JSON array
  `resolvedAt`    DATETIME(3)  NULL,
  `dueDate`       DATETIME(3)  NULL,
  `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `maintenance_tickets_propertyId_status_idx` (`propertyId`, `status`),
  KEY `maintenance_tickets_roomId_idx` (`roomId`),
  KEY `maintenance_tickets_assignedToId_idx` (`assignedToId`),
  CONSTRAINT `maintenance_tickets_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `maintenance_tickets_roomId_fkey` FOREIGN KEY (`roomId`)
    REFERENCES `rooms` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `maintenance_tickets_assignedToId_fkey` FOREIGN KEY (`assignedToId`)
    REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ai_alerts ────────────────────────────────────────────────────────────────
CREATE TABLE `ai_alerts` (
  `id`          VARCHAR(191) NOT NULL,
  `propertyId`  VARCHAR(191) NOT NULL,
  `title`       VARCHAR(191) NOT NULL,
  `description` TEXT         NOT NULL,
  `severity`    ENUM('CRITICAL','HIGH','MEDIUM','LOW') NOT NULL,
  `module`      VARCHAR(191) NOT NULL,
  `isRead`      TINYINT(1)   NOT NULL DEFAULT 0,
  `readAt`      DATETIME(3)  NULL,
  `actionUrl`   VARCHAR(191) NULL,
  `metadata`    LONGTEXT     NULL,  -- JSON
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ai_alerts_propertyId_isRead_idx` (`propertyId`, `isRead`),
  CONSTRAINT `ai_alerts_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── audit_logs ───────────────────────────────────────────────────────────────
CREATE TABLE `audit_logs` (
  `id`          VARCHAR(191) NOT NULL,
  `propertyId`  VARCHAR(191) NOT NULL,
  `userId`      VARCHAR(191) NULL,
  `action`      VARCHAR(191) NOT NULL,
  `entity`      VARCHAR(191) NOT NULL,
  `entityId`    VARCHAR(191) NULL,
  `beforeState` LONGTEXT     NULL,  -- JSON
  `afterState`  LONGTEXT     NULL,  -- JSON
  `ipAddress`   VARCHAR(191) NULL,
  `userAgent`   TEXT         NULL,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_propertyId_entity_idx` (`propertyId`, `entity`),
  KEY `audit_logs_propertyId_createdAt_idx` (`propertyId`, `createdAt`),
  KEY `audit_logs_userId_idx` (`userId`),
  CONSTRAINT `audit_logs_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═════════════════════════════════════════════════════════════════════════════
--  AUTO-UUID triggers (MariaDB 10.1 has no gen_random_uuid()/function defaults).
--  If a row is inserted without an id (or with ''), fill it with UUID().
--  The Prisma client always supplies its own id, so these are just a safety net
--  for manual inserts in phpMyAdmin.
-- ═════════════════════════════════════════════════════════════════════════════

DELIMITER $$
CREATE TRIGGER `bi_tenants`              BEFORE INSERT ON `tenants`              FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_properties`           BEFORE INSERT ON `properties`           FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_users`                BEFORE INSERT ON `users`                FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_room_types`           BEFORE INSERT ON `room_types`           FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_rooms`                BEFORE INSERT ON `rooms`                FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_guests`               BEFORE INSERT ON `guests`               FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_guest_preferences`    BEFORE INSERT ON `guest_preferences`    FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_loyalty_transactions` BEFORE INSERT ON `loyalty_transactions` FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_rate_plans`           BEFORE INSERT ON `rate_plans`           FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_rate_plan_items`      BEFORE INSERT ON `rate_plan_items`      FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_reservations`         BEFORE INSERT ON `reservations`         FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_reservation_extras`   BEFORE INSERT ON `reservation_extras`   FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_payments`             BEFORE INSERT ON `payments`             FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_folios`               BEFORE INSERT ON `folios`               FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_folio_charges`        BEFORE INSERT ON `folio_charges`        FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_housekeeping_tasks`   BEFORE INSERT ON `housekeeping_tasks`   FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_maintenance_tickets`  BEFORE INSERT ON `maintenance_tickets`  FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_ai_alerts`            BEFORE INSERT ON `ai_alerts`            FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
CREATE TRIGGER `bi_audit_logs`           BEFORE INSERT ON `audit_logs`           FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
DELIMITER ;

-- ✅ Schema ready. Next: import database/seed.mariadb.sql
