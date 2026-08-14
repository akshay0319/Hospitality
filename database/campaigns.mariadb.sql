-- ═══════════════════════════════════════════════════════════════════════════════
--  CRM campaigns (AI-drafted marketing to guest segments).
--    "C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/campaigns.mariadb.sql
-- ═══════════════════════════════════════════════════════════════════════════════
USE `hospitality`;

CREATE TABLE IF NOT EXISTS `campaigns` (
  `id`            VARCHAR(191) NOT NULL,
  `propertyId`    VARCHAR(191) NOT NULL,
  `name`          VARCHAR(191) NOT NULL,
  `segment`       VARCHAR(64)  NOT NULL,
  `channel`       ENUM('EMAIL','SMS','WHATSAPP') NOT NULL DEFAULT 'EMAIL',
  `subject`       VARCHAR(255) NULL,
  `body`          LONGTEXT     NOT NULL,
  `audienceCount` INT          NOT NULL DEFAULT 0,
  `status`        ENUM('DRAFT','SCHEDULED','SENT') NOT NULL DEFAULT 'DRAFT',
  `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `campaigns_propertyId_idx` (`propertyId`),
  CONSTRAINT `campaigns_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS `bi_campaigns`;
DELIMITER $$
CREATE TRIGGER `bi_campaigns` BEFORE INSERT ON `campaigns` FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$
DELIMITER ;
