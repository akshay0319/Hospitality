-- Sample maintenance tickets for The Grand Meridian (MariaDB)
USE `hospitality`;

INSERT IGNORE INTO `maintenance_tickets`
  (`id`, `propertyId`, `roomId`, `title`, `description`, `priority`, `status`, `assignedToId`, `reportedById`, `category`, `estimatedCost`, `dueDate`)
VALUES
  ('mnt_1', 'prop_grand_meridian', 'rm_302', 'AC not cooling in Room 302', 'Guest reported the air conditioner runs but does not cool. Likely low refrigerant or compressor fault.', 'CRITICAL', 'IN_PROGRESS', 'usr_hk', 'usr_fd', 'HVAC', 3500.00, DATE_ADD(CURDATE(), INTERVAL 1 DAY)),
  ('mnt_2', 'prop_grand_meridian', 'rm_512', 'Leaking faucet — Suite 512 bathroom', 'Continuous drip from the basin faucet. Needs washer replacement.', 'NORMAL', 'OPEN', NULL, 'usr_hk', 'Plumbing', 800.00, DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
  ('mnt_3', 'prop_grand_meridian', NULL, 'Lobby chandelier flickering', 'Two bulbs in the main lobby chandelier flicker intermittently. Check wiring and replace bulbs.', 'HIGH', 'OPEN', NULL, 'usr_gm', 'Electrical', 2200.00, DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
  ('mnt_4', 'prop_grand_meridian', 'rm_201', 'TV remote not working — Room 201', 'Replace batteries or unit.', 'LOW', 'RESOLVED', 'usr_hk', 'usr_fd', 'Electronics', 200.00, NULL),
  ('mnt_5', 'prop_grand_meridian', 'rm_103', 'Door lock jammed — Room 103', 'Electronic door lock intermittently fails to read keycards. Battery + reader inspection needed.', 'HIGH', 'ON_HOLD', 'usr_hk', 'usr_fd', 'Security', 1500.00, DATE_ADD(CURDATE(), INTERVAL 4 DAY)),
  ('mnt_6', 'prop_grand_meridian', NULL, 'Elevator #2 annual inspection due', 'Schedule the mandatory annual safety inspection with the vendor.', 'NORMAL', 'OPEN', NULL, 'usr_gm', 'Facilities', 12000.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY));

UPDATE `maintenance_tickets` SET `resolvedAt` = NOW(3) WHERE `id` = 'mnt_4' AND `resolvedAt` IS NULL;

SELECT status, COUNT(*) AS n FROM maintenance_tickets GROUP BY status;
