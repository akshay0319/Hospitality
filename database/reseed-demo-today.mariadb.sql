-- ═══════════════════════════════════════════════════════════════════════════════
--  Re-anchor the demo data to TODAY so every page shows live, sensible numbers.
--  Idempotent — safe to re-run anytime the demo drifts.
--    "C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/reseed-demo-today.mariadb.sql
-- ═══════════════════════════════════════════════════════════════════════════════
USE `hospitality`;
SET @today = CURDATE();

-- Housekeeping staff (safety — no-ops if present)
INSERT IGNORE INTO `users` (`id`,`tenantId`,`propertyId`,`email`,`password`,`firstName`,`lastName`,`role`,`department`) VALUES
  ('usr_hk2','tnt_meridian','prop_grand_meridian','sunita@grandmeridian.in','$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq','Sunita','Devi','HOUSEKEEPER','Housekeeping'),
  ('usr_hk3','tnt_meridian','prop_grand_meridian','ramesh@grandmeridian.in','$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq','Ramesh','Kumar','HOUSEKEEPER','Housekeeping');

-- ── 1. In-house guest (Arjun) — live 3-night stay starting today ──────────────
UPDATE `reservations`
  SET `checkIn`=@today, `checkOut`=DATE_ADD(@today, INTERVAL 3 DAY), `status`='CHECKED_IN',
      `roomId`='rm_204', `checkedInAt`=NOW(3), `checkedOutAt`=NULL, `paidAmount`=`totalAmount`, `balanceDue`=0
  WHERE `id`='res_demo_1';

-- ── 2. Today's arrival + departure (recreated fresh each run) ─────────────────
DELETE e FROM `reservation_extras` e JOIN `reservations` r ON r.id=e.reservationId WHERE r.confirmationNumber IN ('HOS-ARR001','HOS-DEP001');
DELETE p FROM `payments` p JOIN `reservations` r ON r.id=p.reservationId WHERE r.confirmationNumber IN ('HOS-ARR001','HOS-DEP001');
DELETE FROM `reservations` WHERE `confirmationNumber` IN ('HOS-ARR001','HOS-DEP001');

INSERT INTO `reservations`
  (`id`,`confirmationNumber`,`propertyId`,`guestId`,`roomId`,`roomTypeId`,`ratePlanId`,`checkIn`,`checkOut`,`nights`,`adults`,`children`,`ratePerNight`,`subTotal`,`taxAmount`,`totalAmount`,`paidAmount`,`balanceDue`,`status`,`channel`,`checkedInAt`)
VALUES
  ('res_demo_arr','HOS-ARR001','prop_grand_meridian','gst_priya','rm_401','rt_clb','rp_bar', @today, DATE_ADD(@today, INTERVAL 2 DAY), 2, 2, 0, 11500, 23000, 4140, 27140,     0, 27140, 'CONFIRMED','BOOKING_COM', NULL),
  ('res_demo_dep','HOS-DEP001','prop_grand_meridian','gst_rahul','rm_501','rt_ste','rp_bar', DATE_SUB(@today, INTERVAL 2 DAY), @today, 2, 2, 0, 22000, 44000, 7920, 51920, 51920,     0, 'CHECKED_IN','DIRECT', DATE_SUB(NOW(3), INTERVAL 2 DAY));

-- ── 3. Housekeeping board — reset to today ───────────────────────────────────
DELETE FROM `housekeeping_tasks` WHERE `propertyId`='prop_grand_meridian';
INSERT INTO `housekeeping_tasks`
  (`id`,`propertyId`,`roomId`,`taskType`,`priority`,`status`,`assignedToId`,`estimatedMinutes`,`startedAt`,`completedAt`,`nextCheckInTime`,`scheduledDate`)
VALUES
  ('hk_1','prop_grand_meridian','rm_102','FULL_CLEAN','URGENT','PENDING',    NULL,      45, NULL,   NULL,   DATE_ADD(@today, INTERVAL 14 HOUR), @today),
  ('hk_2','prop_grand_meridian','rm_512','DEEP_CLEAN','URGENT','PENDING',    NULL,      60, NULL,   NULL,   DATE_ADD(@today, INTERVAL 14 HOUR), @today),
  ('hk_3','prop_grand_meridian','rm_203','FULL_CLEAN','HIGH',  'PENDING',    NULL,      40, NULL,   NULL,   NULL,                               @today),
  ('hk_4','prop_grand_meridian','rm_103','STAYOVER',  'NORMAL','IN_PROGRESS','usr_hk2', 30, NOW(3), NULL,   NULL,                               @today),
  ('hk_5','prop_grand_meridian','rm_301','FULL_CLEAN','HIGH',  'IN_PROGRESS','usr_hk3', 45, NOW(3), NULL,   DATE_ADD(@today, INTERVAL 15 HOUR), @today),
  ('hk_6','prop_grand_meridian','rm_202','FULL_CLEAN','NORMAL','INSPECTING', 'usr_hk3', 40, NOW(3), NULL,   NULL,                               @today),
  ('hk_7','prop_grand_meridian','rm_408','TURNDOWN',  'LOW',   'COMPLETED',  'usr_hk2', 20, NOW(3), NOW(3), NULL,                               @today);

-- ── 4. Sync room statuses to match ───────────────────────────────────────────
UPDATE `rooms` SET `status`='CLEAN'      WHERE `id` IN ('rm_204','rm_401','rm_501','rm_408');
UPDATE `rooms` SET `status`='DIRTY'      WHERE `id` IN ('rm_102','rm_512','rm_203');
UPDATE `rooms` SET `status`='CLEANING'   WHERE `id` IN ('rm_103','rm_301');
UPDATE `rooms` SET `status`='INSPECTING' WHERE `id`='rm_202';

SELECT 'Reservations today' AS what, COUNT(*) n FROM reservations WHERE propertyId='prop_grand_meridian' AND (checkIn=@today OR checkOut=@today OR status='CHECKED_IN')
UNION ALL SELECT 'HK tasks today', COUNT(*) FROM housekeeping_tasks WHERE scheduledDate=@today;
