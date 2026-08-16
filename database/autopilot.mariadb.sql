-- ═══════════════════════════════════════════════════════════════════════════════
--  Revenue Autopilot — per-property toggle + nightly run history.
--    "C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/autopilot.mariadb.sql
-- ═══════════════════════════════════════════════════════════════════════════════
USE `hospitality`;

CREATE TABLE IF NOT EXISTS `autopilot_config` (
  `id`         VARCHAR(191) NOT NULL,
  `propertyId` VARCHAR(191) NOT NULL,
  `enabled`    TINYINT(1)   NOT NULL DEFAULT 0,
  `lastRunAt`  DATETIME(3)  NULL,
  `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ap_property` (`propertyId`),
  CONSTRAINT `ap_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `autopilot_runs` (
  `id`         VARCHAR(191) NOT NULL,
  `propertyId` VARCHAR(191) NOT NULL,
  `applied`    INT          NOT NULL DEFAULT 0,
  `skipped`    INT          NOT NULL DEFAULT 0,
  `trigger`    ENUM('SCHEDULED','MANUAL') NOT NULL DEFAULT 'MANUAL',
  `summary`    VARCHAR(255) NOT NULL,
  `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `apr_property_idx` (`propertyId`),
  CONSTRAINT `apr_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS `bi_autopilot_config`;
DROP TRIGGER IF EXISTS `bi_autopilot_runs`;
DELIMITER $$
CREATE TRIGGER `bi_autopilot_config` BEFORE INSERT ON `autopilot_config` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END$$
CREATE TRIGGER `bi_autopilot_runs` BEFORE INSERT ON `autopilot_runs` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END$$
DELIMITER ;
