import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IsEnum, IsOptional, IsString, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '@/prisma/prisma.service';
import { TaskStatus, TaskPriority, TaskType, RoomStatus } from '@prisma/client';
import dayjs from 'dayjs';

export class CreateTaskDto {
  @ApiProperty() @IsString() roomId: string;
  @ApiProperty({ enum: TaskType }) @IsEnum(TaskType) taskType: TaskType;
  @ApiPropertyOptional({ enum: TaskPriority }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedToId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() estimatedMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledDate?: string;
}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: TaskStatus }) @IsEnum(TaskStatus) status: TaskStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() supervisorNotes?: string;
}

@Injectable()
export class HousekeepingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * A `@db.Date` column stores a calendar date with no time zone. Building the
   * value from local midnight (`.startOf('day').toDate()`) shifts it to the
   * previous UTC day, so we take the local calendar date and anchor it at UTC
   * midnight — which Prisma serializes back to the same date.
   */
  private dateOnly(date?: string): Date {
    return new Date(dayjs(date).format('YYYY-MM-DD'));
  }

  async findAll(propertyId: string, date?: string) {
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

  async findOne(id: string, propertyId: string) {
    const task = await this.prisma.housekeepingTask.findFirst({
      where: { id, propertyId },
      include: { room: true, assignedTo: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(propertyId: string, dto: CreateTaskDto) {
    return this.prisma.housekeepingTask.create({
      data: {
        propertyId,
        roomId: dto.roomId,
        taskType: dto.taskType,
        priority: dto.priority ?? TaskPriority.NORMAL,
        assignedToId: dto.assignedToId,
        estimatedMinutes: dto.estimatedMinutes ?? 30,
        notes: dto.notes,
        scheduledDate: this.dateOnly(dto.scheduledDate),
      },
      include: { room: true, assignedTo: true },
    });
  }

  async updateStatus(id: string, propertyId: string, dto: UpdateTaskStatusDto) {
    const task = await this.findOne(id, propertyId);

    const data: Record<string, unknown> = {
      status: dto.status,
      ...(dto.notes && { notes: dto.notes }),
      ...(dto.supervisorNotes && { supervisorNotes: dto.supervisorNotes }),
    };

    if (dto.status === TaskStatus.IN_PROGRESS && !task.startedAt) {
      data.startedAt = new Date();
    }
    if (dto.status === TaskStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    const updated = await this.prisma.housekeepingTask.update({
      where: { id }, data,
      include: { room: true },
    });

    // Sync room status
    const roomStatusMap: Partial<Record<TaskStatus, RoomStatus>> = {
      [TaskStatus.IN_PROGRESS]: RoomStatus.CLEANING,
      [TaskStatus.INSPECTING]: RoomStatus.INSPECTING,
      [TaskStatus.COMPLETED]: RoomStatus.CLEAN,
    };
    const newRoomStatus = roomStatusMap[dto.status];
    if (newRoomStatus) {
      await this.prisma.room.update({ where: { id: task.roomId }, data: { status: newRoomStatus } });
    }

    return updated;
  }

  async assign(id: string, propertyId: string, assignedToId: string) {
    await this.findOne(id, propertyId);
    return this.prisma.housekeepingTask.update({
      where: { id }, data: { assignedToId },
      include: { assignedTo: true, room: true },
    });
  }

  async getDashboard(propertyId: string) {
    const today = this.dateOnly();

    const [total, pending, inProgress, completed, staff] = await Promise.all([
      this.prisma.housekeepingTask.count({ where: { propertyId, scheduledDate: today } }),
      this.prisma.housekeepingTask.count({ where: { propertyId, scheduledDate: today, status: TaskStatus.PENDING } }),
      this.prisma.housekeepingTask.count({ where: { propertyId, scheduledDate: today, status: TaskStatus.IN_PROGRESS } }),
      this.prisma.housekeepingTask.count({ where: { propertyId, scheduledDate: today, status: TaskStatus.COMPLETED } }),
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

  // AI Optimizer stub — returns prioritized allocation
  async runAIOptimizer(propertyId: string) {
    const tasks = await this.findAll(propertyId);
    const pendingTasks = tasks.filter((t: { status: string }) => t.status === 'PENDING');

    // Simple priority scoring: Urgent + early check-in time = highest priority
    const scored = pendingTasks.map((t: { priority: string; nextCheckInTime?: Date | null }) => ({
      ...t,
      score:
        (t.priority === 'URGENT' ? 100 : t.priority === 'HIGH' ? 60 : t.priority === 'NORMAL' ? 30 : 10) +
        (t.nextCheckInTime ? Math.max(0, 50 - dayjs(t.nextCheckInTime).diff(dayjs(), 'minute') / 10) : 0),
    }));

    return {
      optimizedTasks: scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score),
      insight: `${pendingTasks.length} tasks optimized. ${scored.filter((t: { score: number }) => t.score > 80).length} urgent rooms need attention before 2 PM.`,
    };
  }

  // Accept the AI plan: assign every unassigned pending task (highest-priority first)
  // to the least-loaded housekeeper — a greedy load balance by estimated minutes.
  async acceptAIPlan(propertyId: string) {
    type OptTask = { id: string; assignedToId: string | null; status: string; estimatedMinutes: number | null };
    const { optimizedTasks } = await this.runAIOptimizer(propertyId);
    const items = optimizedTasks as unknown as OptTask[];

    const staff = await this.prisma.user.findMany({
      where: { propertyId, role: { in: ['HOUSEKEEPER', 'HOUSEKEEPING_SUPERVISOR'] }, isActive: true },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!staff.length) throw new BadRequestException('No active housekeeping staff to assign');

    const load: Record<string, number> = Object.fromEntries(staff.map((s) => [s.id, 0]));
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
}
