-- Housekeeping staff + today's tasks for The Grand Meridian (MariaDB)
USE `hospitality`;

-- Two housekeepers (password = demo1234)
INSERT IGNORE INTO `users` (`id`, `tenantId`, `propertyId`, `email`, `password`, `firstName`, `lastName`, `role`, `department`) VALUES
  ('usr_hk2', 'tnt_meridian', 'prop_grand_meridian', 'sunita@grandmeridian.in', '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Sunita', 'Devi',  'HOUSEKEEPER', 'Housekeeping'),
  ('usr_hk3', 'tnt_meridian', 'prop_grand_meridian', 'ramesh@grandmeridian.in', '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Ramesh', 'Kumar', 'HOUSEKEEPER', 'Housekeeping');

-- Clear any existing tasks for today, then seed a fresh board
DELETE FROM `housekeeping_tasks` WHERE `propertyId`='prop_grand_meridian' AND `scheduledDate`=CURDATE();

INSERT INTO `housekeeping_tasks`
  (`id`, `propertyId`, `roomId`, `taskType`, `priority`, `status`, `assignedToId`, `estimatedMinutes`, `startedAt`, `completedAt`, `nextCheckInTime`, `scheduledDate`)
VALUES
  ('hk_1', 'prop_grand_meridian', 'rm_102', 'FULL_CLEAN', 'URGENT', 'PENDING',     NULL,      45, NULL,    NULL,    DATE_ADD(CURDATE(), INTERVAL 14 HOUR), CURDATE()),
  ('hk_2', 'prop_grand_meridian', 'rm_512', 'DEEP_CLEAN', 'URGENT', 'PENDING',     NULL,      60, NULL,    NULL,    DATE_ADD(CURDATE(), INTERVAL 14 HOUR), CURDATE()),
  ('hk_3', 'prop_grand_meridian', 'rm_203', 'FULL_CLEAN', 'HIGH',   'PENDING',     NULL,      40, NULL,    NULL,    NULL,                                  CURDATE()),
  ('hk_4', 'prop_grand_meridian', 'rm_103', 'STAYOVER',   'NORMAL', 'IN_PROGRESS', 'usr_hk2', 30, NOW(3),  NULL,    NULL,                                  CURDATE()),
  ('hk_5', 'prop_grand_meridian', 'rm_301', 'FULL_CLEAN', 'HIGH',   'IN_PROGRESS', 'usr_hk3', 45, NOW(3),  NULL,    DATE_ADD(CURDATE(), INTERVAL 15 HOUR), CURDATE()),
  ('hk_6', 'prop_grand_meridian', 'rm_202', 'FULL_CLEAN', 'NORMAL', 'INSPECTING',  'usr_hk3', 40, NOW(3),  NULL,    NULL,                                  CURDATE()),
  ('hk_7', 'prop_grand_meridian', 'rm_408', 'TURNDOWN',   'LOW',    'COMPLETED',   'usr_hk2', 20, NOW(3),  NOW(3),  NULL,                                  CURDATE());

-- Reflect statuses on the rooms
UPDATE `rooms` SET `status`='DIRTY'      WHERE `id` IN ('rm_102','rm_512','rm_203');
UPDATE `rooms` SET `status`='CLEANING'   WHERE `id` IN ('rm_103','rm_301');
UPDATE `rooms` SET `status`='INSPECTING' WHERE `id`='rm_202';
UPDATE `rooms` SET `status`='CLEAN'      WHERE `id`='rm_408';

SELECT status, COUNT(*) n FROM housekeeping_tasks WHERE scheduledDate=CURDATE() GROUP BY status;
