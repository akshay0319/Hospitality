import { PrismaClient, UserRole, BookingChannel, ReservationStatus, RoomStatus, LoyaltyTier, RatePlanType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HospitalityOS AI database...');

  // ── Tenant ────────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'meridian-group' },
    update: {},
    create: { name: 'Meridian Hotels Group', slug: 'meridian-group', plan: 'enterprise' },
  });
  console.log('✅ Tenant created:', tenant.name);

  // ── Property ──────────────────────────────────────────────────────────────────
  const property = await prisma.property.upsert({
    where: { id: 'prop_grand_meridian' },
    update: {},
    create: {
      id: 'prop_grand_meridian',
      tenantId: tenant.id,
      name: 'The Grand Meridian',
      brand: 'Meridian Hotels',
      chain: 'Meridian Group',
      starRating: 5,
      address: '12, Barakhamba Road, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      phone: '+91 11 4567 8900',
      email: 'reservations@grandmeridian.in',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      gstNumber: '07AABCT1234A1Z5',
      totalRooms: 142,
      checkInTime: '14:00',
      checkOutTime: '12:00',
    },
  });
  console.log('✅ Property created:', property.name);

  // ── Users ─────────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('demo1234', 12);

  const gm = await prisma.user.upsert({
    where: { email: 'manager@grandmeridian.in' },
    update: {},
    create: {
      tenantId: tenant.id,
      propertyId: property.id,
      email: 'manager@grandmeridian.in',
      password: hashedPassword,
      firstName: 'Akshay',
      lastName: 'Kumar',
      role: UserRole.GENERAL_MANAGER,
      department: 'Management',
    },
  });

  await prisma.user.upsert({
    where: { email: 'frontdesk@grandmeridian.in' },
    update: {},
    create: {
      tenantId: tenant.id,
      propertyId: property.id,
      email: 'frontdesk@grandmeridian.in',
      password: hashedPassword,
      firstName: 'Priya',
      lastName: 'Nair',
      role: UserRole.FRONT_DESK,
      department: 'Front Office',
    },
  });

  await prisma.user.upsert({
    where: { email: 'revenue@grandmeridian.in' },
    update: {},
    create: {
      tenantId: tenant.id,
      propertyId: property.id,
      email: 'revenue@grandmeridian.in',
      password: hashedPassword,
      firstName: 'Rohit',
      lastName: 'Verma',
      role: UserRole.REVENUE_MANAGER,
      department: 'Revenue',
    },
  });

  const hkSupervisor = await prisma.user.upsert({
    where: { email: 'housekeeping@grandmeridian.in' },
    update: {},
    create: {
      tenantId: tenant.id,
      propertyId: property.id,
      email: 'housekeeping@grandmeridian.in',
      password: hashedPassword,
      firstName: 'Meena',
      lastName: 'Singh',
      role: UserRole.HOUSEKEEPING_SUPERVISOR,
      department: 'Housekeeping',
    },
  });
  console.log('✅ Users seeded');

  // ── Room Types ────────────────────────────────────────────────────────────────
  const roomTypes = await Promise.all([
    prisma.roomType.upsert({
      where: { propertyId_code: { propertyId: property.id, code: 'STD' } },
      update: {},
      create: {
        propertyId: property.id, name: 'Standard Room', code: 'STD',
        description: 'Comfortable room with city view', maxOccupancy: 2,
        baseRate: 5500, totalCount: 40, sortOrder: 1,
        amenities: JSON.stringify(['King Bed', 'WiFi', 'AC', 'Mini Bar', '32" TV']),
      },
    }),
    prisma.roomType.upsert({
      where: { propertyId_code: { propertyId: property.id, code: 'DLX' } },
      update: {},
      create: {
        propertyId: property.id, name: 'Deluxe Room', code: 'DLX',
        description: 'Spacious room with premium amenities', maxOccupancy: 3,
        baseRate: 7800, totalCount: 50, sortOrder: 2,
        amenities: JSON.stringify(['King Bed', 'WiFi', 'AC', 'Mini Bar', '55" TV', 'Bathtub']),
      },
    }),
    prisma.roomType.upsert({
      where: { propertyId_code: { propertyId: property.id, code: 'CLB' } },
      update: {},
      create: {
        propertyId: property.id, name: 'Club Room', code: 'CLB',
        description: 'Exclusive club floor access and lounge', maxOccupancy: 2,
        baseRate: 11500, totalCount: 30, sortOrder: 3,
        amenities: JSON.stringify(['King Bed', 'Club Lounge', 'WiFi', 'AC', '55" TV', 'Bathtub']),
      },
    }),
    prisma.roomType.upsert({
      where: { propertyId_code: { propertyId: property.id, code: 'STE' } },
      update: {},
      create: {
        propertyId: property.id, name: 'Suite', code: 'STE',
        description: 'Luxurious suite with separate living area', maxOccupancy: 4,
        baseRate: 22000, totalCount: 15, sortOrder: 4,
        amenities: JSON.stringify(['King Bed', 'Living Room', 'Club Lounge', 'WiFi', 'AC', '65" TV', 'Jacuzzi']),
      },
    }),
  ]);
  console.log('✅ Room types seeded:', roomTypes.length);

  // ── Rate Plan ─────────────────────────────────────────────────────────────────
  const barPlan = await prisma.ratePlan.upsert({
    where: { propertyId_code: { propertyId: property.id, code: 'BAR' } },
    update: {},
    create: {
      propertyId: property.id, name: 'Best Available Rate', code: 'BAR', type: RatePlanType.BAR,
    },
  });

  await prisma.ratePlan.upsert({
    where: { propertyId_code: { propertyId: property.id, code: 'CORP' } },
    update: {},
    create: {
      propertyId: property.id, name: 'Corporate Rate', code: 'CORP', type: RatePlanType.CORPORATE,
    },
  });
  console.log('✅ Rate plans seeded');

  // ── Rooms (sample 20) ─────────────────────────────────────────────────────────
  const roomSeeds = [
    { number: '101', floor: 1, typeCode: 'STD', status: RoomStatus.CLEAN },
    { number: '102', floor: 1, typeCode: 'STD', status: RoomStatus.DIRTY },
    { number: '103', floor: 1, typeCode: 'STD', status: RoomStatus.CLEANING },
    { number: '201', floor: 2, typeCode: 'DLX', status: RoomStatus.CLEAN },
    { number: '202', floor: 2, typeCode: 'DLX', status: RoomStatus.INSPECTING },
    { number: '203', floor: 2, typeCode: 'DLX', status: RoomStatus.DIRTY },
    { number: '204', floor: 2, typeCode: 'DLX', status: RoomStatus.CLEAN },
    { number: '301', floor: 3, typeCode: 'DLX', status: RoomStatus.CLEAN },
    { number: '302', floor: 3, typeCode: 'DLX', status: RoomStatus.MAINTENANCE, isBlocked: true, blockReason: 'AC Repair' },
    { number: '401', floor: 4, typeCode: 'CLB', status: RoomStatus.CLEAN },
    { number: '402', floor: 4, typeCode: 'CLB', status: RoomStatus.CLEAN },
    { number: '408', floor: 4, typeCode: 'DLX', status: RoomStatus.CLEAN },
    { number: '501', floor: 5, typeCode: 'STE', status: RoomStatus.CLEAN },
    { number: '502', floor: 5, typeCode: 'STE', status: RoomStatus.CLEAN },
    { number: '512', floor: 5, typeCode: 'STE', status: RoomStatus.DIRTY },
  ];

  const roomTypeMap = Object.fromEntries(roomTypes.map((rt) => [rt.code, rt.id]));
  for (const r of roomSeeds) {
    await prisma.room.upsert({
      where: { propertyId_number: { propertyId: property.id, number: r.number } },
      update: {},
      create: {
        propertyId: property.id,
        number: r.number, floor: r.floor,
        roomTypeId: roomTypeMap[r.typeCode],
        status: r.status,
        isBlocked: r.isBlocked ?? false,
        blockReason: r.blockReason,
      },
    });
  }
  console.log('✅ Rooms seeded:', roomSeeds.length);

  // ── Guests ────────────────────────────────────────────────────────────────────
  const guests = await Promise.all([
    prisma.guest.create({
      data: {
        propertyId: property.id, firstName: 'Arjun', lastName: 'Malhotra',
        email: 'arjun.malhotra@gmail.com', phone: '+91 98765 43210',
        nationality: 'Indian', loyaltyTier: LoyaltyTier.GOLD, loyaltyPoints: 12450,
        totalStays: 18, totalNights: 42, lifetimeValue: 485000, isVip: true,
        tags: JSON.stringify(['VIP', 'Regular', 'Corporate']),
      },
    }),
    prisma.guest.create({
      data: {
        propertyId: property.id, firstName: 'Priya', lastName: 'Sharma',
        email: 'priya.sharma@techcorp.com', phone: '+91 87654 32109',
        nationality: 'Indian', loyaltyTier: LoyaltyTier.SILVER, loyaltyPoints: 3200,
        totalStays: 5, totalNights: 11, lifetimeValue: 124000,
        tags: JSON.stringify(['Corporate']),
      },
    }),
    prisma.guest.create({
      data: {
        propertyId: property.id, firstName: 'Rahul', lastName: 'Gupta',
        email: 'rahul.gupta@ventures.in', phone: '+91 76543 21098',
        nationality: 'Indian', loyaltyTier: LoyaltyTier.PLATINUM, loyaltyPoints: 48700,
        totalStays: 52, totalNights: 134, lifetimeValue: 2180000, isVip: true,
        tags: JSON.stringify(['VIP', 'Platinum']),
      },
    }),
  ]);
  console.log('✅ Guests seeded:', guests.length);

  // ── Sample Reservation ────────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const checkout = new Date(today); checkout.setDate(checkout.getDate() + 3);

  await prisma.reservation.create({
    data: {
      propertyId: property.id,
      confirmationNumber: 'HOS-284731',
      guestId: guests[0].id,
      roomTypeId: roomTypes[1].id,
      ratePlanId: barPlan.id,
      checkIn: today,
      checkOut: checkout,
      nights: 3,
      adults: 2,
      children: 0,
      ratePerNight: 8200,
      subTotal: 24600,
      taxAmount: 4428,
      totalAmount: 29028,
      paidAmount: 29028,
      balanceDue: 0,
      status: ReservationStatus.CHECKED_IN,
      channel: BookingChannel.DIRECT,
    },
  });
  console.log('✅ Sample reservation created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   GM:          manager@grandmeridian.in / demo1234');
  console.log('   Front Desk:  frontdesk@grandmeridian.in / demo1234');
  console.log('   Revenue:     revenue@grandmeridian.in / demo1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
