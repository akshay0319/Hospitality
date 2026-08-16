-- ═══════════════════════════════════════════════════════════════════════════════
--  Cancellation policy (one per property) — drives refund/penalty on cancel.
--    "C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/cancellation-policies.mariadb.sql
-- ═══════════════════════════════════════════════════════════════════════════════
USE `hospitality`;

CREATE TABLE IF NOT EXISTS `cancellation_policies` (
  `id`                    VARCHAR(191) NOT NULL,
  `propertyId`            VARCHAR(191) NOT NULL,
  `name`                  VARCHAR(191) NOT NULL DEFAULT 'Standard',
  `freeCancellationHours` INT          NOT NULL DEFAULT 48,
  `penaltyType`           ENUM('NONE','FIRST_NIGHT','PERCENT','FULL') NOT NULL DEFAULT 'FIRST_NIGHT',
  `penaltyValue`          DECIMAL(5,2) NOT NULL DEFAULT 0,
  `createdAt`             DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cxl_property` (`propertyId`),
  CONSTRAINT `cxl_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS `bi_cancellation_policies`;
DELIMITER $$
CREATE TRIGGER `bi_cancellation_policies` BEFORE INSERT ON `cancellation_policies` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END$$
DELIMITER ;

-- Default: free cancellation up to 48h before check-in, then one night's charge.
INSERT IGNORE INTO `cancellation_policies` (`id`,`propertyId`,`name`,`freeCancellationHours`,`penaltyType`,`penaltyValue`) VALUES
  ('cxl_default','prop_grand_meridian','Standard 48h',48,'FIRST_NIGHT',0);
