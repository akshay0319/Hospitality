-- ═══════════════════════════════════════════════════════════════════════════════
--  HospitalityOS AI — MariaDB / MySQL Seed Data
--  Demo property: The Grand Meridian, New Delhi
--
--  Run AFTER schema.mariadb.sql:
--    "C:\xampp73\mysql\bin\mysql.exe" -u root hospitality < database/seed.mariadb.sql
--    (or phpMyAdmin → Hospitality → Import)
--
--  Login credentials (all): password = demo1234
--    manager@grandmeridian.in       (General Manager)
--    frontdesk@grandmeridian.in     (Front Desk)
--    revenue@grandmeridian.in       (Revenue Manager)
--    housekeeping@grandmeridian.in  (Housekeeping Supervisor)
--
--  Idempotent: uses INSERT IGNORE, safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════════

USE `hospitality`;

-- ── Tenant ───────────────────────────────────────────────────────────────────
INSERT IGNORE INTO `tenants` (`id`, `name`, `slug`, `plan`) VALUES
  ('tnt_meridian', 'Meridian Hotels Group', 'meridian-group', 'enterprise');

-- ── Property ─────────────────────────────────────────────────────────────────
INSERT IGNORE INTO `properties`
  (`id`, `tenantId`, `name`, `brand`, `chain`, `starRating`, `address`, `city`, `state`,
   `country`, `pincode`, `phone`, `email`, `timezone`, `currency`, `gstNumber`,
   `totalRooms`, `checkInTime`, `checkOutTime`)
VALUES
  ('prop_grand_meridian', 'tnt_meridian', 'The Grand Meridian', 'Meridian Hotels', 'Meridian Group', 5,
   '12, Barakhamba Road, Connaught Place', 'New Delhi', 'Delhi',
   'India', '110001', '+91 11 4567 8900', 'reservations@grandmeridian.in',
   'Asia/Kolkata', 'INR', '07AABCT1234A1Z5', 142, '14:00', '12:00');

-- ── Users (password = demo1234, bcrypt cost 12) ──────────────────────────────
INSERT IGNORE INTO `users`
  (`id`, `tenantId`, `propertyId`, `email`, `password`, `firstName`, `lastName`, `role`, `department`)
VALUES
  ('usr_gm',  'tnt_meridian', 'prop_grand_meridian', 'manager@grandmeridian.in',      '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Akshay', 'Kumar', 'GENERAL_MANAGER',         'Management'),
  ('usr_fd',  'tnt_meridian', 'prop_grand_meridian', 'frontdesk@grandmeridian.in',    '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Priya',  'Nair',  'FRONT_DESK',              'Front Office'),
  ('usr_rev', 'tnt_meridian', 'prop_grand_meridian', 'revenue@grandmeridian.in',      '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Rohit',  'Verma', 'REVENUE_MANAGER',         'Revenue'),
  ('usr_hk',  'tnt_meridian', 'prop_grand_meridian', 'housekeeping@grandmeridian.in', '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Meena',  'Singh', 'HOUSEKEEPING_SUPERVISOR', 'Housekeeping');

-- ── Room Types (amenities stored as JSON array text) ─────────────────────────
INSERT IGNORE INTO `room_types`
  (`id`, `propertyId`, `name`, `code`, `description`, `maxOccupancy`, `baseRate`, `totalCount`, `sortOrder`, `amenities`)
VALUES
  ('rt_std', 'prop_grand_meridian', 'Standard Room', 'STD', 'Comfortable room with city view',          2,  5500.00, 40, 1, '["King Bed","WiFi","AC","Mini Bar","32\\" TV"]'),
  ('rt_dlx', 'prop_grand_meridian', 'Deluxe Room',   'DLX', 'Spacious room with premium amenities',      3,  7800.00, 50, 2, '["King Bed","WiFi","AC","Mini Bar","55\\" TV","Bathtub"]'),
  ('rt_clb', 'prop_grand_meridian', 'Club Room',     'CLB', 'Exclusive club floor access and lounge',    2, 11500.00, 30, 3, '["King Bed","Club Lounge","WiFi","AC","55\\" TV","Bathtub"]'),
  ('rt_ste', 'prop_grand_meridian', 'Suite',         'STE', 'Luxurious suite with separate living area', 4, 22000.00, 15, 4, '["King Bed","Living Room","Club Lounge","WiFi","AC","65\\" TV","Jacuzzi"]');

-- ── Rate Plans ───────────────────────────────────────────────────────────────
INSERT IGNORE INTO `rate_plans` (`id`, `propertyId`, `name`, `code`, `type`) VALUES
  ('rp_bar',  'prop_grand_meridian', 'Best Available Rate', 'BAR',  'BAR'),
  ('rp_corp', 'prop_grand_meridian', 'Corporate Rate',      'CORP', 'CORPORATE');

-- ── Rooms (15 sample) ────────────────────────────────────────────────────────
INSERT IGNORE INTO `rooms` (`id`, `propertyId`, `roomTypeId`, `number`, `floor`, `status`, `isBlocked`, `blockReason`) VALUES
  ('rm_101', 'prop_grand_meridian', 'rt_std', '101', 1, 'CLEAN',       0, NULL),
  ('rm_102', 'prop_grand_meridian', 'rt_std', '102', 1, 'DIRTY',       0, NULL),
  ('rm_103', 'prop_grand_meridian', 'rt_std', '103', 1, 'CLEANING',    0, NULL),
  ('rm_201', 'prop_grand_meridian', 'rt_dlx', '201', 2, 'CLEAN',       0, NULL),
  ('rm_202', 'prop_grand_meridian', 'rt_dlx', '202', 2, 'INSPECTING',  0, NULL),
  ('rm_203', 'prop_grand_meridian', 'rt_dlx', '203', 2, 'DIRTY',       0, NULL),
  ('rm_204', 'prop_grand_meridian', 'rt_dlx', '204', 2, 'CLEAN',       0, NULL),
  ('rm_301', 'prop_grand_meridian', 'rt_dlx', '301', 3, 'CLEAN',       0, NULL),
  ('rm_302', 'prop_grand_meridian', 'rt_dlx', '302', 3, 'MAINTENANCE', 1, 'AC Repair'),
  ('rm_401', 'prop_grand_meridian', 'rt_clb', '401', 4, 'CLEAN',       0, NULL),
  ('rm_402', 'prop_grand_meridian', 'rt_clb', '402', 4, 'CLEAN',       0, NULL),
  ('rm_408', 'prop_grand_meridian', 'rt_dlx', '408', 4, 'CLEAN',       0, NULL),
  ('rm_501', 'prop_grand_meridian', 'rt_ste', '501', 5, 'CLEAN',       0, NULL),
  ('rm_502', 'prop_grand_meridian', 'rt_ste', '502', 5, 'CLEAN',       0, NULL),
  ('rm_512', 'prop_grand_meridian', 'rt_ste', '512', 5, 'DIRTY',       0, NULL);

-- ── Guests (tags stored as JSON array text) ──────────────────────────────────
INSERT IGNORE INTO `guests`
  (`id`, `propertyId`, `firstName`, `lastName`, `email`, `phone`, `nationality`,
   `loyaltyTier`, `loyaltyPoints`, `totalStays`, `totalNights`, `lifetimeValue`, `isVip`, `tags`)
VALUES
  ('gst_arjun', 'prop_grand_meridian', 'Arjun', 'Malhotra', 'arjun.malhotra@gmail.com',  '+91 98765 43210', 'Indian', 'GOLD',     12450, 18, 42,  485000.00, 1, '["VIP","Regular","Corporate"]'),
  ('gst_priya', 'prop_grand_meridian', 'Priya', 'Sharma',   'priya.sharma@techcorp.com', '+91 87654 32109', 'Indian', 'SILVER',    3200,  5, 11,  124000.00, 0, '["Corporate"]'),
  ('gst_rahul', 'prop_grand_meridian', 'Rahul', 'Gupta',    'rahul.gupta@ventures.in',   '+91 76543 21098', 'Indian', 'PLATINUM', 48700, 52, 134, 2180000.00, 1, '["VIP","Platinum"]');

-- ── Sample Reservation (in-house today, 3 nights) ────────────────────────────
INSERT IGNORE INTO `reservations`
  (`id`, `confirmationNumber`, `propertyId`, `guestId`, `roomId`, `roomTypeId`, `ratePlanId`,
   `checkIn`, `checkOut`, `nights`, `adults`, `children`,
   `ratePerNight`, `subTotal`, `taxAmount`, `totalAmount`, `paidAmount`, `balanceDue`,
   `status`, `channel`, `checkedInAt`)
VALUES
  ('res_demo_1', 'HOS-284731', 'prop_grand_meridian', 'gst_arjun', 'rm_204', 'rt_dlx', 'rp_bar',
   CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 3, 2, 0,
   8200.00, 24600.00, 4428.00, 29028.00, 29028.00, 0.00,
   'CHECKED_IN', 'DIRECT', NOW(3));

-- ── Folio for the in-house reservation ───────────────────────────────────────
INSERT IGNORE INTO `folios` (`id`, `reservationId`, `totalCharges`, `totalPayments`, `balance`, `isClosed`) VALUES
  ('fol_demo_1', 'res_demo_1', 29028.00, 29028.00, 0.00, 0);

-- ── AI alerts for the dashboard ──────────────────────────────────────────────
INSERT IGNORE INTO `ai_alerts` (`id`, `propertyId`, `title`, `description`, `severity`, `module`, `isRead`) VALUES
  ('alert_1', 'prop_grand_meridian', 'Weekend likely undersold', '4 Deluxe rooms unsold for Sat — AI suggests +12% rate cut on Fri to fill.', 'MEDIUM', 'revenue', 0),
  ('alert_2', 'prop_grand_meridian', 'VIP arrival not pre-assigned', 'Platinum guest Rahul Gupta arrives in 3h; suite 501 not yet inspected.', 'HIGH', 'frontdesk', 0);

-- ✅ Seed complete.
