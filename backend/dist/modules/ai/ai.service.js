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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const prisma_service_1 = require("../../prisma/prisma.service");
const context_service_1 = require("../context/context.service");
const MAX_TOOL_ITERATIONS = 4;
let AiService = AiService_1 = class AiService {
    constructor(prisma, context) {
        this.prisma = prisma;
        this.context = context;
        this.logger = new common_1.Logger(AiService_1.name);
        const key = process.env.OPENAI_API_KEY?.trim();
        this.model = process.env.AI_MODEL?.trim() || 'gpt-4o-mini';
        this.client = key ? new openai_1.default({ apiKey: key }) : null;
        if (!this.client)
            this.logger.warn('No OPENAI_API_KEY set — Copilot runs in demo mode.');
    }
    get isLive() {
        return !!this.client;
    }
    writeTools() {
        return [
            {
                type: 'function',
                function: {
                    name: 'create_maintenance_ticket',
                    description: 'Log a new maintenance ticket. Use when the manager asks to report/create a maintenance issue.',
                    parameters: {
                        type: 'object',
                        properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            priority: { type: 'string', enum: ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'] },
                            roomNumber: { type: 'string', description: 'Room number if the issue is in a specific room' },
                            category: { type: 'string' },
                        },
                        required: ['title', 'description'],
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: 'block_room',
                    description: 'Block a room from availability (e.g. for maintenance or deep cleaning).',
                    parameters: {
                        type: 'object',
                        properties: { roomNumber: { type: 'string' }, reason: { type: 'string' } },
                        required: ['roomNumber', 'reason'],
                    },
                },
            },
        ];
    }
    tools(allowWrites) {
        const read = [
            {
                type: 'function',
                function: {
                    name: 'list_reservations',
                    description: 'List reservations, optionally filtered by status (PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED).',
                    parameters: {
                        type: 'object',
                        properties: { status: { type: 'string' }, limit: { type: 'number' } },
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: 'search_guests',
                    description: 'Search guests by name or email. Returns loyalty tier, stays, and lifetime value.',
                    parameters: {
                        type: 'object',
                        properties: { query: { type: 'string' } },
                        required: ['query'],
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: 'get_revenue_analytics',
                    description: 'Get daily revenue, occupancy, ADR and RevPAR trend for the last N days (default 14).',
                    parameters: { type: 'object', properties: { days: { type: 'number' } } },
                },
            },
            {
                type: 'function',
                function: {
                    name: 'list_open_maintenance',
                    description: 'List open/in-progress maintenance tickets with priority and location.',
                    parameters: { type: 'object', properties: {} },
                },
            },
        ];
        return [...read, ...(allowWrites ? this.writeTools() : [])];
    }
    async runTool(propertyId, name, args, allowWrites) {
        const isWrite = name === 'create_maintenance_ticket' || name === 'block_room';
        if (isWrite && !allowWrites)
            return { error: 'Write actions are disabled. Ask the manager to enable actions first.' };
        switch (name) {
            case 'create_maintenance_ticket': {
                const roomNumber = args.roomNumber ? String(args.roomNumber) : null;
                const room = roomNumber ? await this.prisma.room.findFirst({ where: { propertyId, number: roomNumber }, select: { id: true } }) : null;
                const t = await this.prisma.maintenanceTicket.create({
                    data: {
                        propertyId, roomId: room?.id ?? null,
                        title: String(args.title), description: String(args.description),
                        priority: (typeof args.priority === 'string' ? args.priority : 'NORMAL'),
                        category: args.category ? String(args.category) : null,
                    },
                });
                return { ok: true, created: 'maintenance_ticket', title: t.title, priority: t.priority, room: roomNumber ?? 'common area' };
            }
            case 'block_room': {
                const room = await this.prisma.room.findFirst({ where: { propertyId, number: String(args.roomNumber) }, select: { id: true, number: true } });
                if (!room)
                    return { error: `Room ${args.roomNumber} not found` };
                await this.prisma.room.update({ where: { id: room.id }, data: { isBlocked: true, status: 'BLOCKED', blockReason: String(args.reason) } });
                return { ok: true, blocked: room.number, reason: String(args.reason) };
            }
            case 'list_reservations': {
                const status = typeof args.status === 'string' ? args.status : undefined;
                const take = Math.min(Number(args.limit) || 15, 30);
                const rows = await this.prisma.reservation.findMany({
                    where: { propertyId, ...(status && { status: status }) },
                    include: { guest: { select: { firstName: true, lastName: true } }, roomType: { select: { name: true } } },
                    orderBy: { checkIn: 'desc' }, take,
                });
                return rows.map((r) => ({
                    confirmation: r.confirmationNumber, guest: `${r.guest.firstName} ${r.guest.lastName}`,
                    roomType: r.roomType?.name, checkIn: r.checkIn, checkOut: r.checkOut,
                    nights: r.nights, total: Number(r.totalAmount), status: r.status, channel: r.channel,
                }));
            }
            case 'search_guests': {
                const q = String(args.query ?? '');
                const rows = await this.prisma.guest.findMany({
                    where: { propertyId, OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { email: { contains: q } }] },
                    take: 10,
                });
                return rows.map((g) => ({
                    name: `${g.firstName} ${g.lastName}`, email: g.email, tier: g.loyaltyTier,
                    stays: g.totalStays, lifetimeValue: Number(g.lifetimeValue), vip: g.isVip,
                }));
            }
            case 'get_revenue_analytics': {
                const days = Math.min(Number(args.days) || 14, 60);
                return this.revenueTrend(propertyId, days);
            }
            case 'list_open_maintenance': {
                const rows = await this.prisma.maintenanceTicket.findMany({
                    where: { propertyId, status: { notIn: ['RESOLVED', 'CLOSED'] } },
                    include: { room: { select: { number: true } } },
                    orderBy: { createdAt: 'desc' }, take: 20,
                });
                return rows.map((t) => ({
                    title: t.title, priority: t.priority, status: t.status,
                    room: t.room?.number ?? 'common area', category: t.category,
                }));
            }
            default:
                return { error: `Unknown tool ${name}` };
        }
    }
    async revenueTrend(propertyId, days) {
        const out = [];
        for (let i = days - 1; i >= 0; i--) {
            const day = new Date();
            day.setDate(day.getDate() - i);
            const ds = day.toISOString().slice(0, 10);
            const start = new Date(ds);
            const end = new Date(ds);
            end.setDate(end.getDate() + 1);
            const [pay, sold] = await Promise.all([
                this.prisma.payment.aggregate({ where: { reservation: { propertyId }, status: 'PAID', createdAt: { gte: start, lt: end } }, _sum: { amount: true } }),
                this.prisma.reservation.count({ where: { propertyId, status: { in: ['CHECKED_IN', 'CHECKED_OUT'] }, checkIn: { lte: start }, checkOut: { gt: start } } }),
            ]);
            out.push({ date: ds, revenue: Number(pay._sum.amount ?? 0), roomsSold: sold });
        }
        return out;
    }
    async chat(propertyId, messages, allowWrites = false) {
        const snapshot = await this.context.getSnapshot(propertyId);
        if (!this.client) {
            return { answer: this.demoAnswer(snapshot), grounded: true, live: false, toolsUsed: [] };
        }
        const system = `You are the AI Operations Copilot for ${snapshot.property.name}, a ${snapshot.property.starRating}-star hotel in ${snapshot.property.city}. ` +
            `You help managers understand and run the property. Answer concisely (short paragraphs or bullet points). ` +
            `Use ONLY real data — never invent numbers. Call tools when you need detail beyond the snapshot. ` +
            `Currency is ${snapshot.property.currency} (₹). Today is ${snapshot.date}.` +
            (allowWrites
                ? ` Actions are ENABLED: you may create maintenance tickets or block rooms when the manager clearly asks. Only act on explicit requests, and state plainly what you did.`
                : ` Actions are disabled — you are read-only. If asked to change something, say actions must be enabled first.`) +
            `\n\nLIVE PROPERTY SNAPSHOT:\n${JSON.stringify(snapshot)}`;
        const convo = [
            { role: 'system', content: system },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];
        const toolsUsed = [];
        let chart = null;
        for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
            const resp = await this.client.chat.completions.create({
                model: this.model,
                messages: convo,
                tools: this.tools(allowWrites),
                tool_choice: 'auto',
                temperature: 0.2,
            });
            const msg = resp.choices[0].message;
            if (msg.tool_calls?.length) {
                convo.push(msg);
                for (const tc of msg.tool_calls) {
                    if (tc.type !== 'function')
                        continue;
                    let args = {};
                    try {
                        args = JSON.parse(tc.function.arguments || '{}');
                    }
                    catch { }
                    toolsUsed.push(tc.function.name);
                    const result = await this.runTool(propertyId, tc.function.name, args, allowWrites);
                    if (tc.function.name === 'get_revenue_analytics')
                        chart = result;
                    convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result).slice(0, 6000) });
                }
                continue;
            }
            return { answer: msg.content ?? '', grounded: true, live: true, model: this.model, toolsUsed, chart };
        }
        return { answer: 'I gathered a lot of data but need a more specific question to summarise it well.', grounded: true, live: true, toolsUsed, chart };
    }
    demoAnswer(snapshot) {
        return (`**Demo mode** (no OpenAI key configured). Here's a live snapshot of ${snapshot.property.name}:\n\n` +
            `• Occupancy: ${snapshot.occupancy.occupancyPct}% (${snapshot.occupancy.checkedIn} in-house, ${snapshot.occupancy.availableRooms} available)\n` +
            `• Today: ${snapshot.today.arrivals} arrivals, ${snapshot.today.departures} departures\n` +
            `• Housekeeping: ${snapshot.housekeeping.pending} pending, ${snapshot.housekeeping.inProgress} in progress\n` +
            `• Maintenance: ${snapshot.maintenance.open} open (${snapshot.maintenance.critical} critical)\n` +
            `Add an OPENAI_API_KEY to .env for full conversational answers.`);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        context_service_1.ContextService])
], AiService);
//# sourceMappingURL=ai.service.js.map