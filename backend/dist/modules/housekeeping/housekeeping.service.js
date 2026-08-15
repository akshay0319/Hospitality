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
exports.HousekeepingService = exports.UpdateTaskStatusDto = exports.CreateTaskDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.TaskType }),
    (0, class_validator_1.IsEnum)(client_1.TaskType),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.TaskPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaskPriority),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "estimatedMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "scheduledDate", void 0);
class UpdateTaskStatusDto {
}
exports.UpdateTaskStatusDto = UpdateTaskStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.TaskStatus }),
    (0, class_validator_1.IsEnum)(client_1.TaskStatus),
    __metadata("design:type", String)
], UpdateTaskStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskStatusDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskStatusDto.prototype, "supervisorNotes", void 0);
let HousekeepingService = class HousekeepingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    dateOnly(date) {
        return new Date((0, dayjs_1.default)(date).format('YYYY-MM-DD'));
    }
    async findAll(propertyId, date) {
        const scheduledDate = this.dateOnly(date);
        return this.prisma.housekeepingTask.findMany({
            where: { propertyId, scheduledDate },
            include: {
                room: { include: { roomType: { select: { name: true, code: true } } } },
                assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
            orderBy: [{ priority: 'asc' }, { nextCheckInTime: 'asc' }],
        });
    }
    async findOne(id, propertyId) {
        const task = await this.prisma.housekeepingTask.findFirst({
            where: { id, propertyId },
            include: { room: true, assignedTo: true },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return task;
    }
    async create(propertyId, dto) {
        return this.prisma.housekeepingTask.create({
            data: {
                propertyId,
                roomId: dto.roomId,
                taskType: dto.taskType,
                priority: dto.priority ?? client_1.TaskPriority.NORMAL,
                assignedToId: dto.assignedToId,
                estimatedMinutes: dto.estimatedMinutes ?? 30,
                notes: dto.notes,
                scheduledDate: this.dateOnly(dto.scheduledDate),
            },
            include: { room: true, assignedTo: true },
        });
    }
    async updateStatus(id, propertyId, dto) {
        const task = await this.findOne(id, propertyId);
        const data = {
            status: dto.status,
            ...(dto.notes && { notes: dto.notes }),
            ...(dto.supervisorNotes && { supervisorNotes: dto.supervisorNotes }),
        };
        if (dto.status === client_1.TaskStatus.IN_PROGRESS && !task.startedAt) {
            data.startedAt = new Date();
        }
        if (dto.status === client_1.TaskStatus.COMPLETED) {
            data.completedAt = new Date();
        }
        const updated = await this.prisma.housekeepingTask.update({
            where: { id }, data,
            include: { room: true },
        });
        const roomStatusMap = {
            [client_1.TaskStatus.IN_PROGRESS]: client_1.RoomStatus.CLEANING,
            [client_1.TaskStatus.INSPECTING]: client_1.RoomStatus.INSPECTING,
            [client_1.TaskStatus.COMPLETED]: client_1.RoomStatus.CLEAN,
        };
        const newRoomStatus = roomStatusMap[dto.status];
        if (newRoomStatus) {
            await this.prisma.room.update({ where: { id: task.roomId }, data: { status: newRoomStatus } });
        }
        return updated;
    }
    async assign(id, propertyId, assignedToId) {
        await this.findOne(id, propertyId);
        return this.prisma.housekeepingTask.update({
            where: { id }, data: { assignedToId },
            include: { assignedTo: true, room: true },
        });
    }
    async getDashboard(propertyId) {
        const today = this.dateOnly();
        const [total, pending, inProgress, completed, staff] = await Promise.all([
            this.prisma.housekeepingTask.count({ where: { propertyId, scheduledDate: today } }),
            this.prisma.housekeepingTask.count({ where: { propertyId, scheduledDate: today, status: client_1.TaskStatus.PENDING } }),
            this.prisma.housekeepingTask.count({ where: { propertyId, scheduledDate: today, status: client_1.TaskStatus.IN_PROGRESS } }),
            this.prisma.housekeepingTask.count({ where: { propertyId, scheduledDate: today, status: client_1.TaskStatus.COMPLETED } }),
            this.prisma.user.findMany({
                where: { propertyId, role: { in: ['HOUSEKEEPER', 'HOUSEKEEPING_SUPERVISOR'] }, isActive: true },
                select: {
                    id: true, firstName: true, lastName: true, avatarUrl: true, role: true,
                    _count: { select: { hkTasks: true } },
                },
            }),
        ]);
        return { total, pending, inProgress, completed, staff };
    }
    async runAIOptimizer(propertyId) {
        const tasks = await this.findAll(propertyId);
        const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
        const scored = pendingTasks.map((t) => ({
            ...t,
            score: (t.priority === 'URGENT' ? 100 : t.priority === 'HIGH' ? 60 : t.priority === 'NORMAL' ? 30 : 10) +
                (t.nextCheckInTime ? Math.max(0, 50 - (0, dayjs_1.default)(t.nextCheckInTime).diff((0, dayjs_1.default)(), 'minute') / 10) : 0),
        }));
        return {
            optimizedTasks: scored.sort((a, b) => b.score - a.score),
            insight: `${pendingTasks.length} tasks optimized. ${scored.filter((t) => t.score > 80).length} urgent rooms need attention before 2 PM.`,
        };
    }
    async acceptAIPlan(propertyId) {
        const { optimizedTasks } = await this.runAIOptimizer(propertyId);
        const items = optimizedTasks;
        const staff = await this.prisma.user.findMany({
            where: { propertyId, role: { in: ['HOUSEKEEPER', 'HOUSEKEEPING_SUPERVISOR'] }, isActive: true },
            select: { id: true, firstName: true, lastName: true },
        });
        if (!staff.length)
            throw new common_1.BadRequestException('No active housekeeping staff to assign');
        const load = Object.fromEntries(staff.map((s) => [s.id, 0]));
        const toAssign = items.filter((t) => !t.assignedToId && t.status === 'PENDING');
        for (const t of toAssign) {
            const pick = staff.reduce((a, b) => (load[a.id] <= load[b.id] ? a : b));
            load[pick.id] += t.estimatedMinutes ?? 30;
            await this.prisma.housekeepingTask.update({ where: { id: t.id }, data: { assignedToId: pick.id } });
        }
        return {
            assigned: toAssign.length,
            alreadyAssigned: items.filter((t) => t.assignedToId).length,
            perStaff: staff
                .map((s) => ({ name: `${s.firstName} ${s.lastName}`, minutes: load[s.id] }))
                .filter((s) => s.minutes > 0)
                .sort((a, b) => b.minutes - a.minutes),
        };
    }
};
exports.HousekeepingService = HousekeepingService;
exports.HousekeepingService = HousekeepingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HousekeepingService);
//# sourceMappingURL=housekeeping.service.js.map