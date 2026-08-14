-- ═══════════════════════════════════════════════════════════════════════════════
--  HospitalityOS AI — PostgreSQL Seed Data
--  Demo property: The Grand Meridian, New Delhi
--
--  Run AFTER schema.postgres.sql:
--    psql -d hospitality_os -f database/seed.postgres.sql
--
--  Login credentials (all): password = demo1234
--    manager@grandmeridian.in       (General Manager)
--    frontdesk@grandmeridian.in     (Front Desk)
--    revenue@grandmeridian.in       (Revenue Manager)
--    housekeeping@grandmeridian.in  (Housekeeping Supervisor)
--
--  Idempotent: safe to re-run (ON CONFLICT DO NOTHING on natural keys).
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Tenant ───────────────────────────────────────────────────────────────────
INSERT INTO "tenants" ("id", "name", "slug", "plan")
VALUES ('tnt_meridian', 'Meridian Hotels Group', 'meridian-group', 'enterprise')
ON CONFLICT ("slug") DO NOTHING;

-- ── Property ─────────────────────────────────────────────────────────────────
INSERT INTO "properties" (
  "id", "tenantId", "name", "brand", "chain", "starRating",
  "address", "city", "state", "country", "pincode", "phone", "email",
  "timezone", "currency", "gstNumber", "totalRooms", "checkInTime", "checkOutTime"
) VALUES (
  'prop_grand_meridian', 'tnt_meridian', 'The Grand Meridian', 'Meridian Hotels', 'Meridian Group', 5,
  '12, Barakhamba Road, Connaught Place', 'New Delhi', 'Delhi', 'India', '110001',
  '+91 11 4567 8900', 'reservations@grandmeridian.in',
  'Asia/Kolkata', 'INR', '07AABCT1234A1Z5', 142, '14:00', '12:00'
) ON CONFLICT ("id") DO NOTHING;

-- ── Users (password = demo1234) ──────────────────────────────────────────────
-- password column holds bcrypt(demo1234, cost 12)
INSERT INTO "users" ("id", "tenantId", "propertyId", "email", "password", "firstName", "lastName", "role", "department") VALUES
  ('usr_gm',   'tnt_meridian', 'prop_grand_meridian', 'manager@grandmeridian.in',      '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Akshay', 'Kumar',  'GENERAL_MANAGER',         'Management'),
  ('usr_fd',   'tnt_meridian', 'prop_grand_meridian', 'frontdesk@grandmeridian.in',    '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Priya',  'Nair',   'FRONT_DESK',              'Front Office'),
  ('usr_rev',  'tnt_meridian', 'prop_grand_meridian', 'revenue@grandmeridian.in',      '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Rohit',  'Verma',  'REVENUE_MANAGER',         'Revenue'),
  ('usr_hk',   'tnt_meridian', 'prop_grand_meridian', 'housekeeping@grandmeridian.in', '$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq', 'Meena',  'Singh',  'HOUSEKEEPING_SUPERVISOR', 'Housekeeping')
ON CONFLICT ("email") DO NOTHING;

-- ── Room Types ───────────────────────────────────────────────────────────────
INSERT INTO "room_types" ("id", "propertyId", "name", "code", "description", "maxOccupancy", "baseRate", "totalCount", "sortOrder", "amenities") VALUES
  ('rt_std', 'prop_grand_meridian', 'Standard Room', 'STD', 'Comfortable room with city view',          2,  5500.00, 40, 1, ARRAY['King Bed','WiFi','AC','Mini Bar','32" TV']),
  ('rt_dlx', 'prop_grand_meridian', 'Deluxe Room',   'DLX', 'Spacious room with premium amenities',      3,  7800.00, 50, 2, ARRAY['King Bed','WiFi','AC','Mini Bar','55" TV','Bathtub']),
  ('rt_clb', 'prop_grand_meridian', 'Club Room',     'CLB', 'Exclusive club floor access and lounge',    2, 11500.00, 30, 3, ARRAY['King Bed','Club Lounge','WiFi','AC','55" TV','Bathtub']),
  ('rt_ste', 'prop_grand_meridian', 'Suite',         'STE', 'Luxurious suite with separate living area', 4, 22000.00, 15, 4, ARRAY['King Bed','Living Room','Club Lounge','WiFi','AC','65" TV','Jacuzzi'])
ON CONFLICT ("propertyId", "code") DO NOTHING;

-- ── Rate Plans ───────────────────────────────────────────────────────────────
INSERT INTO "rate_plans" ("id", "propertyId", "name", "code", "type") VALUES
  ('rp_bar',  'prop_grand_meridian', 'Best Available Rate', 'BAR',  'BAR'),
  ('rp_corp', 'prop_grand_meridian', 'Corporate Rate',      'CORP', 'CORPORATE')
ON CONFLICT ("propertyId", "code") DO NOTHING;

-- ── Rooms (15 sample) ────────────────────────────────────────────────────────
INSERT INTO "rooms" ("id", "propertyId", "roomTypeId", "number", "floor", "status", "isBlocked", "blockReason") VALUES
  ('rm_101', 'prop_grand_meridian', 'rt_std', '101', 1, 'CLEAN',       false, NULL),
  ('rm_102', 'prop_grand_meridian', 'rt_std', '102', 1, 'DIRTY',       false, NULL),
  ('rm_103', 'prop_grand_meridian', 'rt_std', '103', 1, 'CLEANING',    false, NULL),
  ('rm_201', 'prop_grand_meridian', 'rt_dlx', '201', 2, 'CLEAN',       false, NULL),
  ('rm_202', 'prop_grand_meridian', 'rt_dlx', '202', 2, 'INSPECTING',  false, NULL),
  ('rm_203', 'prop_grand_meridian', 'rt_dlx', '203', 2, 'DIRTY',       false, NULL),
  ('rm_204', 'prop_grand_meridian', 'rt_dlx', '204', 2, 'CLEAN',       false, NULL),
  ('rm_301', 'prop_grand_meridian', 'rt_dlx', '301', 3, 'CLEAN',       false, NULL),
  ('rm_302', 'prop_grand_meridian', 'rt_dlx', '302', 3, 'MAINTENANCE', true,  'AC Repair'),
  ('rm_401', 'prop_grand_meridian', 'rt_clb', '401', 4, 'CLEAN',       false, NULL),
  ('rm_402', 'prop_grand_meridian', 'rt_clb', '402', 4, 'CLEAN',       false, NULL),
  ('rm_408', 'prop_grand_meridian', 'rt_dlx', '408', 4, 'CLEAN',       false, NULL),
  ('rm_501', 'prop_grand_meridian', 'rt_ste', '501', 5, 'CLEAN',       false, NULL),
  ('rm_502', 'prop_grand_meridian', 'rt_ste', '502', 5, 'CLEAN',       false, NULL),
  ('rm_512', 'prop_grand_meridian', 'rt_ste', '512', 5, 'DIRTY',       false, NULL)
ON CONFLICT ("propertyId", "number") DO NOTHING;

-- ── Guests ───────────────────────────────────────────────────────────────────
INSERT INTO "guests" ("id", "propertyId", "firstName", "lastName", "email", "phone", "nationality", "loyaltyTier", "loyaltyPoints", "totalStays", "totalNights", "lifetimeValue", "isVip", "tags") VALUES
  ('gst_arjun', 'prop_grand_meridian', 'Arjun', 'Malhotra', 'arjun.malhotra@gmail.com',  '+91 98765 43210', 'Indian', 'GOLD',     12450, 18, 42,  485000.00, true,  ARRAY['VIP','Regular','Corporate']),
  ('gst_priya', 'prop_grand_meridian', 'Priya', 'Sharma',   'priya.sharma@techcorp.com', '+91 87654 32109', 'Indian', 'SILVER',    3200,  5, 11,  124000.00, false, ARRAY['Corporate']),
  ('gst_rahul', 'prop_grand_meridian', 'Rahul', 'Gupta',    'rahul.gupta@ventures.in',   '+91 76543 21098', 'Indian', 'PLATINUM', 48700, 52, 134, 2180000.00, true, ARRAY['VIP','Platinum'])
ON CONFLICT ("id") DO NOTHING;

-- ── Sample Reservation (in-house today, 3 nights) ────────────────────────────
INSERT INTO "reservations" (
  "id", "confirmationNumber", "propertyId", "guestId", "roomId", "roomTypeId", "ratePlanId",
  "checkIn", "checkOut", "nights", "adults", "children",
  "ratePerNight", "subTotal", "taxAmount", "totalAmount", "paidAmount", "balanceDue",
  "status", "channel", "checkedInAt"
) VALUES (
  'res_demo_1', 'HOS-284731', 'prop_grand_meridian', 'gst_arjun', 'rm_204', 'rt_dlx', 'rp_bar',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 3, 2, 0,
  8200.00, 24600.00, 4428.00, 29028.00, 29028.00, 0.00,
  'CHECKED_IN', 'DIRECT', CURRENT_TIMESTAMP
) ON CONFLICT ("confirmationNumber") DO NOTHING;

-- ── Folio for the in-house reservation ───────────────────────────────────────
INSERT INTO "folios" ("id", "reservationId", "totalCharges", "totalPayments", "balance", "isClosed")
VALUES ('fol_demo_1', 'res_demo_1', 29028.00, 29028.00, 0.00, false)
ON CONFLICT ("reservationId") DO NOTHING;

-- ── A couple of AI alerts for the dashboard ──────────────────────────────────
INSERT INTO "ai_alerts" ("id", "propertyId", "title", "description", "severity", "module", "isRead") VALUES
  ('alert_1', 'prop_grand_meridian', 'Weekend likely undersold', '4 Deluxe rooms unsold for Sat — AI suggests +12% rate cut on Fri to fill.', 'MEDIUM', 'revenue', false),
  ('alert_2', 'prop_grand_meridian', 'VIP arrival not pre-assigned', 'Platinum guest Rahul Gupta arrives in 3h; suite 501 not yet inspected.', 'HIGH', 'frontdesk', false)
ON CONFLICT ("id") DO NOTHING;

COMMIT;

-- ✅ Seed complete.
