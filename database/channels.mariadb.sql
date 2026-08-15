-- ═══════════════════════════════════════════════════════════════════════════════
--  Channel Manager — OTA connections + sync log (mock sandbox).
--    "C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/channels.mariadb.sql
-- ═══════════════════════════════════════════════════════════════════════════════
USE `hospitality`;

CREATE TABLE IF NOT EXISTS `channels` (
  `id`            VARCHAR(191) NOT NULL,
  `propertyId`    VARCHAR(191) NOT NULL,
  `code`          VARCHAR(32)  NOT NULL,   -- maps to BookingChannel (BOOKING_COM, EXPEDIA, …)
  `name`          VARCHAR(191) NOT NULL,
  `isConnected`   TINYINT(1)   NOT NULL DEFAULT 0,
  `commissionPct` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `autoSync`      TINYINT(1)   NOT NULL DEFAULT 1,
  `lastSyncAt`    DATETIME(3)  NULL,
  `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `channels_property_code` (`propertyId`, `code`),
  CONSTRAINT `channels_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `channel_sync_logs` (
  `id`         VARCHAR(191) NOT NULL,
  `propertyId` VARCHAR(191) NOT NULL,
  `channelId`  VARCHAR(191) NOT NULL,
  `direction`  ENUM('PUSH','PULL') NOT NULL,
  `summary`    VARCHAR(255) NOT NULL,
  `count`      INT          NOT NULL DEFAULT 0,
  `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `csl_property_idx` (`propertyId`),
  KEY `csl_channel_idx` (`channelId`),
  CONSTRAINT `csl_channel_fk` FOREIGN KEY (`channelId`) REFERENCES `channels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS `bi_channels`;
DROP TRIGGER IF EXISTS `bi_channel_sync_logs`;
DELIMITER $$
CREATE TRIGGER `bi_channels` BEFORE INSERT ON `channels` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END$$
CREATE TRIGGER `bi_channel_sync_logs` BEFORE INSERT ON `channel_sync_logs` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END$$
DELIMITER ;

-- Seed the 6 OTAs for the demo property (disconnected until the manager connects them).
INSERT IGNORE INTO `channels` (`id`,`propertyId`,`code`,`name`,`isConnected`,`commissionPct`) VALUES
  ('ch_bcom',    'prop_grand_meridian','BOOKING_COM','Booking.com', 0, 15.00),
  ('ch_exp',     'prop_grand_meridian','EXPEDIA',    'Expedia',     0, 18.00),
  ('ch_airbnb',  'prop_grand_meridian','AIRBNB',     'Airbnb',      0,  3.00),
  ('ch_mmt',     'prop_grand_meridian','MAKEMYTRIP', 'MakeMyTrip',  0, 20.00),
  ('ch_goibibo', 'prop_grand_meridian','GOIBIBO',    'Goibibo',     0, 18.00),
  ('ch_agoda',   'prop_grand_meridian','AGODA',      'Agoda',       0, 17.00);
