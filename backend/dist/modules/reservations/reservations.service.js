"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let ReservationsService = class ReservationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateConfirmationNumber() {
        return `HOS-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    toDateOnly(date) {
        return new Date((0, dayjs_1.default)(date).format('YYYY-MM-DD'));
    }
    async checkAvailability(propertyId, query) {
        const checkIn = this.toDateOnly(query.checkIn);
        const checkOut = this.toDateOnly(query.checkOut);
        const nights = (0, dayjs_1.default)(checkOut).diff((0, dayjs_1.default)(checkIn), 'day');
        if (nights <= 0)
            throw new common_1.BadRequestException('Check-out must be after check-in');
        const roomTypes = await this.prisma.roomType.findMany({
            where: { propertyId, isActive: true },
            include: {
                rooms: { where: { isBlocked: false } },
                ratePlanItems: {
                    where: { date: { gte: checkIn, lt: checkOut } },
                    include: { ratePlan: true },
                },
            },
        });
        const results = await Promise.all(roomTypes.map(async (rt) => {
            const overlapping = await this.prisma.reservation.count({
                where: {
                    propertyId,
                    roomTypeId: rt.id,
                    status: { in: [client_1.ReservationStatus.CONFIRMED, client_1.ReservationStatus.CHECKED_IN] },
                    checkIn: { lt: checkOut },
                    checkOut: { gt: checkIn },
                },
            });
            const available = rt.totalCount - overlapping;
            const avgRate = rt.ratePlanItems.length > 0
                ? rt.ratePlanItems.reduce((s, i) => s + Number(i.ratePerNight), 0) / rt.ratePlanItems.length
                : Number(rt.baseRate);
            return {
                roomType: rt,
                available: Math.max(0, available),
                nights,
                ratePerNight: avgRate,
                totalRate: avgRate * nights,
            };
        }));
        return results.filter((r) => r.available > 0);
    }
    async findAll(propertyId, query) {
        const where = { propertyId };
        if (query.status)
            where.status = query.status;
        if (query.channel)
            where.channel = query.channel;
        if (query.checkInFrom || query.checkInTo) {
            where.checkIn = {
                ...(query.checkInFrom && { gte: new Date(query.checkInFrom) }),
                ...(query.checkInTo && { lte: new Date(query.checkInTo) }),
            };
        }
        if (query.search) {
            where.OR = [
                { confirmationNumber: { contains: query.search } },
                { guest: { firstName: { contains: query.search } } },
                { guest: { lastName: { contains: query.search } } },
                { guest: { email: { contains: query.search } } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.reservation.findMany({
                where,
                include: {
                    guest: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, loyaltyTier: true } },
                    room: { select: { id: true, number: true, floor: true } },
                    roomType: { select: { id: true, name: true, code: true } },
                    ratePlan: { select: { id: true, name: true, code: true } },
                    extras: true,
                    payments: true,
                },
                skip: query.skip,
                take: query.limit ?? 20,
                orderBy: { checkIn: 'asc' },
            }),
            this.prisma.reservation.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(data, total, query.page ?? 1, query.limit ?? 20);
    }
    async findOne(id, propertyId) {
        const res = await this.prisma.reservation.findFirst({
            where: { id, propertyId },
            include: {
                guest: { include: { preferences: true } },
                room: true,
                roomType: true,
                ratePlan: true,
                extras: true,
                payments: true,
                folio: { include: { charges: true } },
            },
        });
        if (!res)
            throw new common_1.NotFoundException('Reservation not found');
        return res;
    }
    async create(propertyId, dto) {
        const checkIn = this.toDateOnly(dto.checkIn);
        const checkOut = this.toDateOnly(dto.checkOut);
        const nights = (0, dayjs_1.default)(checkOut).diff((0, dayjs_1.default)(checkIn), 'day');
        if (nights <= 0)
            throw new common_1.BadRequestException('Check-out must be after check-in');
        const [guest, roomType, ratePlan] = await Promise.all([
            this.prisma.guest.findFirst({ where: { id: dto.guestId, propertyId } }),
            this.prisma.roomType.findFirst({ where: { id: dto.roomTypeId, propertyId } }),
            this.prisma.ratePlan.findFirst({ where: { id: dto.ratePlanId, propertyId } }),
        ]);
        if (!guest)
            throw new common_1.NotFoundException('Guest not found');
        if (!roomType)
            throw new common_1.NotFoundException('Room type not found');
        if (!ratePlan)
            throw new common_1.NotFoundException('Rate plan not found');
        const overlapping = await this.prisma.reservation.count({
            where: {
                propertyId,
                roomTypeId: dto.roomTypeId,
                status: { in: [client_1.ReservationStatus.CONFIRMED, client_1.ReservationStatus.CHECKED_IN] },
                checkIn: { lt: checkOut },
                checkOut: { gt: checkIn },
            },
        });
        if (overlapping >= roomType.totalCount) {
            throw new common_1.ConflictException('No rooms available for the selected dates');
        }
        const ratePerNight = Number(roomType.baseRate);
        const subTotal = ratePerNight * nights;
        const taxRate = 0.18;
        const taxAmount = subTotal * taxRate;
        const totalAmount = subTotal + taxAmount;
        const extrasTotal = (dto.extras ?? []).reduce((s, e) => s + e.price * e.quantity, 0);
        const res = await this.prisma.reservation.create({
            data: {
                propertyId,
                confirmationNumber: this.generateConfirmationNumber(),
                guestId: dto.guestId,
                roomTypeId: dto.roomTypeId,
                ratePlanId: dto.ratePlanId,
                roomId: dto.roomId,
                checkIn,
                checkOut,
                nights,
                adults: dto.adults,
                children: dto.children ?? 0,
                ratePerNight,
                subTotal,
                taxAmount,
                totalAmount: totalAmount + extrasTotal,
                balanceDue: totalAmount + extrasTotal,
                paidAmount: 0,
                status: client_1.ReservationStatus.CONFIRMED,
                channel: dto.channel ?? 'DIRECT',
                specialRequests: dto.specialRequests,
                otaConfirmationNo: dto.otaConfirmationNo,
                extras: dto.extras ? {
                    create: dto.extras.map((e) => ({
                        name: e.name,
                        description: e.description,
                        price: e.price,
                        quantity: e.quantity,
                        totalPrice: e.price * e.quantity,
                    })),
                } : undefined,
            },
            include: {
                guest: true, roomType: true, ratePlan: true, extras: true,
            },
        });
        await this.prisma.guest.update({
            where: { id: dto.guestId },
            data: { totalStays: { increment: 1 } },
        });
        return res;
    }
    async update(id, propertyId, dto) {
        const existing = await this.findOne(id, propertyId);
        if ([client_1.ReservationStatus.CANCELLED, client_1.ReservationStatus.CHECKED_OUT, client_1.ReservationStatus.NO_SHOW].includes(existing.status)) {
            throw new common_1.BadRequestException('Cannot modify a closed reservation');
        }
        const data = {
            ...(dto.roomId && { roomId: dto.roomId }),
            ...(dto.specialRequests !== undefined && { specialRequests: dto.specialRequests }),
            ...(dto.adults !== undefined && { adults: dto.adults }),
            ...(dto.children !== undefined && { children: dto.children }),
            ...(dto.channel && { channel: dto.channel }),
            ...(dto.ratePlanId && { ratePlanId: dto.ratePlanId }),
        };
        const roomTypeChanged = !!dto.roomTypeId && dto.roomTypeId !== existing.roomTypeId;
        if (dto.checkIn || dto.checkOut || roomTypeChanged) {
            const checkIn = dto.checkIn ? this.toDateOnly(dto.checkIn) : existing.checkIn;
            const checkOut = dto.checkOut ? this.toDateOnly(dto.checkOut) : existing.checkOut;
            const nights = (0, dayjs_1.default)(checkOut).diff((0, dayjs_1.default)(checkIn), 'day');
            if (nights <= 0)
                throw new common_1.BadRequestException('Check-out must be after check-in');
            const roomTypeId = dto.roomTypeId ?? existing.roomTypeId;
            const roomType = await this.prisma.roomType.findFirst({ where: { id: roomTypeId, propertyId } });
            if (!roomType)
                throw new common_1.NotFoundException('Room type not found');
            const overlapping = await this.prisma.reservation.count({
                where: {
                    propertyId,
                    roomTypeId,
                    status: { in: [client_1.ReservationStatus.CONFIRMED, client_1.ReservationStatus.CHECKED_IN] },
                    checkIn: { lt: checkOut },
                    checkOut: { gt: checkIn },
                    NOT: { id },
                },
            });
            if (overlapping >= roomType.totalCount) {
                throw new common_1.ConflictException('No rooms available for the selected dates');
            }
            const ratePerNight = Number(roomType.baseRate);
            const subTotal = ratePerNight * nights;
            const taxAmount = subTotal * 0.18;
            const extrasTotal = (existing.extras ?? []).reduce((s, e) => s + Number(e.totalPrice), 0);
            const grandTotal = subTotal + taxAmount + extrasTotal;
            Object.assign(data, {
                checkIn,
                checkOut,
                nights,
                roomTypeId,
                ratePerNight,
                subTotal,
                taxAmount,
                totalAmount: grandTotal,
                balanceDue: grandTotal - Number(existing.paidAmount),
            });
        }
        return this.prisma.reservation.update({
            where: { id },
            data,
            include: { guest: true, roomType: true, room: true, ratePlan: true },
        });
    }
    async cancel(id, propertyId, reason) {
        const res = await this.findOne(id, propertyId);
        if (res.status === client_1.ReservationStatus.CHECKED_IN) {
            throw new common_1.BadRequestException('Cannot cancel a checked-in reservation. Please check out instead.');
        }
        if ([client_1.ReservationStatus.CANCELLED, client_1.ReservationStatus.CHECKED_OUT].includes(res.status)) {
            throw new common_1.BadRequestException('Reservation is already closed');
        }
        return this.prisma.reservation.update({
            where: { id },
            data: {
                status: client_1.ReservationStatus.CANCELLED,
                cancelledAt: new Date(),
                cancellationReason: reason ?? 'Guest request',
            },
        });
    }
    async checkIn(id, propertyId, dto) {
        const res = await this.findOne(id, propertyId);
        if (res.status !== client_1.ReservationStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Only confirmed reservations can be checked in');
        }
        const roomId = dto.roomId ?? res.roomId;
        if (!roomId)
            throw new common_1.BadRequestException('A room must be assigned before check-in');
        const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        if (room.status !== client_1.RoomStatus.CLEAN)
            throw new common_1.BadRequestException('Room is not clean. Please assign a clean room.');
        const [updated] = await this.prisma.$transaction([
            this.prisma.reservation.update({
                where: { id },
                data: {
                    status: client_1.ReservationStatus.CHECKED_IN,
                    roomId,
                    checkedInAt: new Date(),
                },
                include: { guest: true, room: true, roomType: true },
            }),
            this.prisma.room.update({ where: { id: roomId }, data: { status: client_1.RoomStatus.DIRTY } }),
        ]);
        await this.prisma.folio.upsert({
            where: { reservationId: id },
            create: {
                reservationId: id,
                totalCharges: res.totalAmount,
                totalPayments: res.paidAmount,
                balance: res.balanceDue,
            },
            update: {},
        });
        if (dto.idDocumentUrl) {
            await this.prisma.guest.update({
                where: { id: res.guestId },
                data: { idDocumentUrl: dto.idDocumentUrl },
            });
        }
        return updated;
    }
    async checkOut(id, propertyId, dto) {
        const res = await this.findOne(id, propertyId);
        if (res.status !== client_1.ReservationStatus.CHECKED_IN) {
            throw new common_1.BadRequestException('Only checked-in reservations can be checked out');
        }
        const [updated] = await this.prisma.$transaction([
            this.prisma.reservation.update({
                where: { id },
                data: {
                    status: client_1.ReservationStatus.CHECKED_OUT,
                    checkedOutAt: new Date(),
                    internalNotes: dto.notes,
                },
                include: { guest: true, room: true, roomType: true, folio: true },
            }),
            ...(res.roomId ? [this.prisma.room.update({
                    where: { id: res.roomId },
                    data: { status: client_1.RoomStatus.DIRTY },
                })] : []),
            this.prisma.folio.updateMany({
                where: { reservationId: id },
                data: { isClosed: true, closedAt: new Date() },
            }),
        ]);
        await this.prisma.guest.update({
            where: { id: res.guestId },
            data: {
                lifetimeValue: { increment: res.totalAmount },
                totalNights: { increment: res.nights },
                lastStayAt: new Date(),
            },
        });
        if (res.roomId) {
            await this.prisma.housekeepingTask.create({
                data: {
                    propertyId,
                    roomId: res.roomId,
                    taskType: 'FULL_CLEAN',
                    priority: 'NORMAL',
                    scheduledDate: new Date((0, dayjs_1.default)().format('YYYY-MM-DD')),
                },
            });
        }
        return updated;
    }
    async getTodaySummary(propertyId) {
        const today = this.toDateOnly();
        const tomorrow = new Date((0, dayjs_1.default)().add(1, 'day').format('YYYY-MM-DD'));
        const [arrivals, departures, inHouse, noShows] = await Promise.all([
            this.prisma.reservation.count({
                where: { propertyId, checkIn: { gte: today, lt: tomorrow }, status: client_1.ReservationStatus.CONFIRMED },
            }),
            this.prisma.reservation.count({
                where: { propertyId, checkOut: { gte: today, lt: tomorrow }, status: client_1.ReservationStatus.CHECKED_IN },
            }),
            this.prisma.reservation.count({
                where: { propertyId, status: client_1.ReservationStatus.CHECKED_IN },
            }),
            this.prisma.reservation.count({
                where: { propertyId, checkIn: { gte: today, lt: tomorrow }, status: client_1.ReservationStatus.NO_SHOW },
            }),
        ]);
        return { arrivals, departures, inHouse, noShows };
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map