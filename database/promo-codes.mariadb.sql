-- Promo codes for the booking engine (MariaDB)
USE `hospitality`;

CREATE TABLE IF NOT EXISTS `promo_codes` (
  `id`            VARCHAR(191) NOT NULL,
  `propertyId`    VARCHAR(191) NOT NULL,
  `code`          VARCHAR(191) NOT NULL,
  `discountType`  ENUM('PERCENT','FLAT') NOT NULL DEFAULT 'PERCENT',
  `discountValue` DECIMAL(10,2) NOT NULL,
  `isActive`      TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `promo_codes_propertyId_code_key` (`propertyId`, `code`),
  CONSTRAINT `promo_codes_propertyId_fkey` FOREIGN KEY (`propertyId`)
    REFERENCES `properties` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS `bi_promo_codes`;
DELIMITER $$
CREATE TRIGGER `bi_promo_codes` BEFORE INSERT ON `promo_codes` FOR EACH ROW
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF $$
DELIMITER ;

INSERT IGNORE INTO `promo_codes` (`id`, `propertyId`, `code`, `discountType`, `discountValue`) VALUES
  ('promo_welcome', 'prop_grand_meridian', 'WELCOME10', 'PERCENT', 10),
  ('promo_flat500', 'prop_grand_meridian', 'FLAT500',   'FLAT',    500);

SELECT code, discountType, discountValue FROM promo_codes;
