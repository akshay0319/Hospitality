import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IsEnum, IsOptional, IsString, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '@/prisma/prisma.service';
import { RatePlanType, ReservationStatus } from '@prisma/client';
import dayjs from 'dayjs';

export class CreateRatePlanDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiProperty({ enum: RatePlanType }) @IsEnum(RatePlanType) type: RatePlanType;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() minStay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxStay?: number;
}

export class SetRateDto {
  @ApiProperty() @IsString() roomTypeId: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty() @IsNumber() ratePerNight: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isLocked?: boolean;
}

export class BulkRateDto {
  @ApiProperty() @IsString() roomTypeId: string;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiProperty() @IsNumber() ratePerNight: number;
}

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ── Rate Plans ────────────────────────────────────────────────────────────────

  async findRatePlans(propertyId: string) {
    return this.prisma.ratePlan.findMany({
      where: { propertyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createRatePlan(propertyId: string, dto: CreateRatePlanDto) {
    return this.prisma.ratePlan.create({ data: { ...dto, propertyId } });
  }

  // ── Rate Grid ─────────────────────────────────────────────────────────────────

  async getRateGrid(propertyId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [ratePlans, roomTypes, rateItems] = await Promise.all([
      this.prisma.ratePlan.findMany({ where: { propertyId, isActive: true } }),
      this.prisma.roomType.findMany({ where: { propertyId, isActive: true } }),
      this.prisma.ratePlanItem.findMany({
        where: {
          ratePlan: { propertyId },
          date: { gte: start, lte: end },
        },
        include: {
          ratePlan: { select: { id: true, name: true, code: true } },
          roomType: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    return { ratePlans, roomTypes, rateItems };
  }

  async setRate(propertyId: string, ratePlanId: string, dto: SetRateDto) {
    const ratePlan = await this.prisma.ratePlan.findFirst({ where: { id: ratePlanId, propertyId } });
    if (!ratePlan) throw new NotFoundException('Rate plan not found');

    return this.prisma.ratePlanItem.upsert({
      where: {
        ratePlanId_roomTypeId_date: {
          ratePlanId,
          roomTypeId: dto.roomTypeId,
          date: new Date(dto.date),
        },
      },
      create: {
        ratePlanId,
        roomTypeId: dto.roomTypeId,
        date: new Date(dto.date),
        ratePerNight: dto.ratePerNight,
        isLocked: dto.isLocked ?? false,
      },
      update: {
        ratePerNight: dto.ratePerNight,
        ...(dto.isLocked !== undefined && { isLocked: dto.isLocked }),
      },
    });
  }

  async setBulkRates(propertyId: string, ratePlanId: string, dto: BulkRateDto) {
    const ratePlan = await this.prisma.ratePlan.findFirst({ where: { id: ratePlanId, propertyId } });
    if (!ratePlan) throw new NotFoundException('Rate plan not found');

    const dates: Date[] = [];
    let current = dayjs(dto.startDate);
    const end = dayjs(dto.endDate);
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.toDate());
      current = current.add(1, 'day');
    }

    await this.prisma.$transaction(
      dates.map((date) =>
        this.prisma.ratePlanItem.upsert({
          where: { ratePlanId_roomTypeId_date: { ratePlanId, roomTypeId: dto.roomTypeId, date } },
          create: { ratePlanId, roomTypeId: dto.roomTypeId, date, ratePerNight: dto.ratePerNight },
          update: { ratePerNight: dto.ratePerNight },
        }),
      ),
    );

    return { updated: dates.length, startDate: dto.startDate, endDate: dto.endDate };
  }

  // ── AI Rate Recommendations ────────────────────────────────────────────────────

  async getAIRecommendations(propertyId: string) {
    const today = dayjs().startOf('day');
    const next30Days = today.add(30, 'day').toDate();

    const roomTypes = await this.prisma.roomType.findMany({ where: { propertyId, isActive: true } });

    const recommendations = await Promise.all(
      roomTypes.map(async (rt) => {
        const dates = [];
        for (let i = 1; i <= 14; i++) {
          const date = today.add(i, 'day');
          const dateVal = date.toDate();

          const [booked, currentRate] = await Promise.all([
            this.prisma.reservation.count({
              where: {
                propertyId, roomTypeId: rt.id,
                status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
                checkIn: { lte: dateVal }, checkOut: { gt: dateVal },
              },
            }),
            this.prisma.ratePlanItem.findFirst({
              where: { roomTypeId: rt.id, date: dateVal },
              orderBy: { createdAt: 'desc' },
            }),
          ]);

          const occupancyPct = rt.totalCount > 0 ? (booked / rt.totalCount) * 100 : 0;
          const baseRate = Number(currentRate?.ratePerNight ?? rt.baseRate);

          let multiplier = 1.0;
          if (occupancyPct > 85) multiplier = 1.20;
          else if (occupancyPct > 70) multiplier = 1.10;
          else if (occupancyPct < 40) multiplier = 0.88;
          else if (occupancyPct < 25) multiplier = 0.80;

          const isWeekend = [5, 6].includes(date.day());
          if (isWeekend) multiplier *= 1.08;

          const recommended = Math.round(baseRate * multiplier / 100) * 100;
          const variance = recommended - baseRate;

          dates.push({
            date: date.format('YYYY-MM-DD'),
            roomTypeId: rt.id,
            roomTypeName: rt.name,
            currentRate: baseRate,
            recommendedRate: recommended,
            variance,
            variancePercent: Number(((variance / baseRate) * 100).toFixed(1)),
            occupancyPct: Number(occupancyPct.toFixed(1)),
            demandScore: Math.round(occupancyPct),
            isLocked: currentRate?.isLocked ?? false,
          });
        }
        return dates;
      }),
    );

    return recommendations.flat().sort((a, b) => a.date.localeCompare(b.date));
  }

  async acceptRecommendation(propertyId: string, ratePlanId: string, roomTypeId: string, date: string, rate: number) {
    return this.setRate(propertyId, ratePlanId, { roomTypeId, date, ratePerNight: rate });
  }

  /**
   * Autopilot: apply AI rate recommendations within guardrails — skip locked
   * cells, skip trivial (<3%) changes, and clamp any change to ±20% of current.
   * Every run is logged; a nightly cron drives the SCHEDULED trigger.
   */
  async runAutopilot(propertyId: string, trigger: 'MANUAL' | 'SCHEDULED' = 'MANUAL') {
    const recs = await this.getAIRecommendations(propertyId);
    const plan =
      (await this.prisma.ratePlan.findFirst({ where: { propertyId, type: 'BAR' } })) ??
      (await this.prisma.ratePlan.findFirst({ where: { propertyId } }));
    if (!plan) return { applied: 0, skippedLocked: 0, skippedSmall: 0, total: 0, summary: 'No rate plan configured' };

    let applied = 0, skippedLocked = 0, skippedSmall = 0;
    for (const r of recs) {
      if (r.isLocked) { skippedLocked++; continue; }
      if (Math.abs(r.variancePercent) < 3) { skippedSmall++; continue; }
      const clamped = Math.max(r.currentRate * 0.8, Math.min(r.currentRate * 1.2, r.recommendedRate));
      await this.setRate(propertyId, plan.id, {
        roomTypeId: r.roomTypeId, date: r.date, ratePerNight: Math.round(clamped / 100) * 100,
      });
      applied++;
    }

    const summary = `Applied ${applied} rate change(s) within ±20% guardrails; skipped ${skippedLocked} locked, ${skippedSmall} minor.`;
    await this.prisma.autopilotRun.create({ data: { propertyId, applied, skipped: skippedLocked + skippedSmall, trigger: trigger as never, summary } });
    await this.prisma.autopilotConfig.upsert({
      where: { propertyId },
      create: { propertyId, enabled: trigger === 'SCHEDULED', lastRunAt: new Date() },
      update: { lastRunAt: new Date() },
    });
    return { applied, skippedLocked, skippedSmall, total: recs.length, summary };
  }

  // ── Autonomous Revenue Agent: config + history + nightly schedule ────────────
  async getAutopilotStatus(propertyId: string) {
    const [config, runs] = await Promise.all([
      this.prisma.autopilotConfig.findUnique({ where: { propertyId } }),
      this.prisma.autopilotRun.findMany({ where: { propertyId }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);
    return { enabled: config?.enabled ?? false, lastRunAt: config?.lastRunAt ?? null, runs };
  }

  async toggleAutopilot(propertyId: string, enabled: boolean) {
    const c = await this.prisma.autopilotConfig.upsert({
      where: { propertyId }, create: { propertyId, enabled }, update: { enabled },
    });
    return { enabled: c.enabled };
  }

  // Runs the autopilot for every property that has it enabled.
  async runScheduledAutopilot() {
    const configs = await this.prisma.autopilotConfig.findMany({ where: { enabled: true } });
    for (const c of configs) {
      try { await this.runAutopilot(c.propertyId, 'SCHEDULED'); }
      catch (e) { this.logger.error(`Autopilot failed for ${c.propertyId}: ${(e as Error).message}`); }
    }
    return configs.length;
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async nightlyAutopilot() {
    const n = await this.runScheduledAutopilot();
    if (n) this.logger.log(`Nightly autopilot ran for ${n} property(ies)`);
  }

  /**
   * Demand forecast: on-books occupancy + a naive booking-pace and weekend lift.
   * ponytail: heuristic (no ML); swap the projection for a trained model later.
   */
  async getForecast(propertyId: string, days = 14) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId }, select: { totalRooms: true } });
    const total = property?.totalRooms || 1;
    const out: { day: string; occupancy: number; onBooks: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = dayjs().add(i, 'day');
      const date = new Date(d.format('YYYY-MM-DD'));
      const onBooks = await this.prisma.reservation.count({
        where: {
          propertyId,
          status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
          checkIn: { lte: date }, checkOut: { gt: date },
        },
      });
      const weekendLift = [5, 6].includes(d.day()) ? 15 : 0;
      const paceAssumption = 25; // rooms expected to fill closer to arrival
      const occupancy = Math.min(100, Math.round((onBooks / total) * 100) + paceAssumption + weekendLift);
      out.push({ day: d.format('MMM D'), occupancy, onBooks });
    }
    return out;
  }
}
