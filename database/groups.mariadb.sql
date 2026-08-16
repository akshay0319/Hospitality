-- ═══════════════════════════════════════════════════════════════════════════════
--  Group reservations — a named block of rooms under one contact.
--    "C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/groups.mariadb.sql
-- ═══════════════════════════════════════════════════════════════════════════════
USE `hospitality`;

CREATE TABLE IF NOT EXISTS `groups` (
  `id`           VARCHAR(191) NOT NULL,
  `propertyId`   VARCHAR(191) NOT NULL,
  `name`         VARCHAR(191) NOT NULL,
  `contactName`  VARCHAR(191) NOT NULL,
  `contactEmail` VARCHAR(191) NULL,
  `contactPhone` VARCHAR(64)  NULL,
  `checkIn`      DATE         NOT NULL,
  `checkOut`     DATE         NOT NULL,
  `status`       ENUM('INQUIRY','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  `notes`        VARCHAR(500) NULL,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `groups_property_idx` (`propertyId`),
  CONSTRAINT `groups_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS `bi_groups`;
DELIMITER $$
CREATE TRIGGER `bi_groups` BEFORE INSERT ON `groups` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END$$
DELIMITER ;

-- Link reservations to a group (nullable; SET NULL so members survive group deletion).
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='hospitality' AND TABLE_NAME='reservations' AND COLUMN_NAME='groupId');
SET @sql := IF(@col=0, 'ALTER TABLE `reservations` ADD COLUMN `groupId` VARCHAR(191) NULL, ADD KEY `res_group_idx` (`groupId`), ADD CONSTRAINT `res_group_fk` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE SET NULL', 'SELECT "groupId already present"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
