import { Injectable, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import OpenAI from 'openai';
import dayjs from 'dayjs';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGuestDto, UpdateGuestDto, GuestPreferenceDto } from './dto/guest.dto';
import { PaginationDto, paginate } from '@/common/dto/pagination.dto';
import { toJsonString } from '@/prisma/json-fields';

export class GenerateCampaignDto {
  @ApiProperty() @IsString() segment: string;
  @ApiPropertyOptional() @IsOptional() @IsString() goal?: string;
}
export class CreateCampaignDto {
  @ApiProperty() @IsString() @MinLength(1) name: string;
  @ApiProperty() @IsString() segment: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subject?: string;
  @ApiProperty() @IsString() @MinLength(1) body: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() audienceCount?: number;
}

@Injectable()
export class GuestsService {
  private readonly ai: OpenAI | null;
  private readonly aiModel: string;

  constructor(private readonly prisma: PrismaService) {
    const key = process.env.OPENAI_API_KEY?.trim();
    this.aiModel = process.env.AI_MODEL?.trim() || 'gpt-4o-mini';
    this.ai = key ? new OpenAI({ apiKey: key }) : null;
  }

  async findAll(propertyId: string, query: PaginationDto) {
    const where = {
      propertyId,
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search } },
          { lastName: { contains: query.search } },
          { email: { contains: query.search } },
          { phone: { contains: query.search } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.guest.findMany({
        where, include: { preferences: true },
        skip: query.skip, take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.guest.count({ where }),
    ]);
    return paginate(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async segments(propertyId: string) {
    const [total, vip, platinum, gold, returning, highValue] = await Promise.all([
      this.prisma.guest.count({ where: { propertyId } }),
      this.prisma.guest.count({ where: { propertyId, isVip: true } }),
      this.prisma.guest.count({ where: { propertyId, loyaltyTier: 'PLATINUM' } }),
      this.prisma.guest.count({ where: { propertyId, loyaltyTier: 'GOLD' } }),
      this.prisma.guest.count({ where: { propertyId, totalStays: { gt: 1 } } }),
      this.prisma.guest.count({ where: { propertyId, lifetimeValue: { gte: 500000 } } }),
    ]);
    return {
      total,
      segments: [
        { key: 'vip', label: 'VIP Guests', count: vip, description: 'Flagged VIP — priority service' },
        { key: 'platinum', label: 'Platinum Tier', count: platinum, description: 'Top loyalty tier' },
        { key: 'gold', label: 'Gold Tier', count: gold, description: 'High loyalty tier' },
        { key: 'returning', label: 'Returning Guests', count: returning, description: 'More than one stay' },
        { key: 'highvalue', label: 'High Value', count: highValue, description: 'Lifetime value ≥ ₹5L' },
      ],
    };
  }

  async findOne(id: string, propertyId: string) {
    const guest = await this.prisma.guest.findFirst({
      where: { id, propertyId },
      include: {
        preferences: true,
        reservations: {
          orderBy: { checkIn: 'desc' },
          take: 10,
          include: { roomType: true, ratePlan: true },
        },
        loyaltyTxns: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async create(propertyId: string, dto: CreateGuestDto) {
    const { tags, ...rest } = dto;
    return this.prisma.guest.create({
      data: { ...rest, propertyId, tags: toJsonString(tags) },
      include: { preferences: true },
    });
  }

  async update(id: string, propertyId: string, dto: UpdateGuestDto) {
    await this.findOne(id, propertyId);
    const { tags, ...rest } = dto;
    return this.prisma.guest.update({
      where: { id },
      data: { ...rest, ...(tags !== undefined && { tags: toJsonString(tags) }) },
      include: { preferences: true },
    });
  }

  async upsertPreferences(guestId: string, propertyId: string, dto: GuestPreferenceDto) {
    await this.findOne(guestId, propertyId);
    // `noDisturbance` exists on the DTO but not the model — exclude it.
    const { dietaryRestrictions, noDisturbance: _drop, ...rest } = dto;
    const data = {
      ...rest,
      ...(dietaryRestrictions !== undefined && { dietaryRestrictions: toJsonString(dietaryRestrictions) }),
    };
    return this.prisma.guestPreference.upsert({
      where: { guestId },
      create: { guestId, ...data },
      update: { ...data },
    });
  }

  // ── AI CRM: churn risk + LTV projection ─────────────────────────────────────
  // Transparent RFM-style heuristic (no training data needed): recency drives churn,
  // and projected LTV = current value + avg stay value × expected future stays × tier boost.
  private scoreGuest(g: { lifetimeValue: unknown; totalStays: number; loyaltyTier: string; isVip: boolean; lastStayAt: Date | null; createdAt: Date }) {
    const ltv = Number(g.lifetimeValue);
    const avgStay = g.totalStays > 0 ? ltv / g.totalStays : 0;
    const last = g.lastStayAt ?? (g.totalStays > 0 ? g.createdAt : null);
    const daysSince = last ? dayjs().diff(dayjs(last), 'day') : null;
    const tierBoost = g.isVip || g.loyaltyTier === 'PLATINUM' ? 1.5 : g.loyaltyTier === 'GOLD' ? 1.25 : 1;

    let churnRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEW';
    let churnReason: string;
    let expectedFutureStays: number;
    if (g.totalStays === 0) { churnRisk = 'NEW'; churnReason = 'No completed stays yet'; expectedFutureStays = 0.5; }
    else if (daysSince === null) { churnRisk = 'LOW'; churnReason = 'Recently added'; expectedFutureStays = 2; }
    else if (daysSince > 180) { churnRisk = 'HIGH'; churnReason = `${daysSince} days since last stay`; expectedFutureStays = 0.5; }
    else if (daysSince > 90) { churnRisk = 'MEDIUM'; churnReason = `${daysSince} days since last stay`; expectedFutureStays = 1.5; }
    else { churnRisk = 'LOW'; churnReason = `Stayed ${daysSince} days ago`; expectedFutureStays = 3; }

    const ltvProjection = Math.round(ltv + avgStay * expectedFutureStays * tierBoost);
    return { daysSince, churnRisk, churnReason, ltvProjection };
  }

  async insights(propertyId: string) {
    const guests = await this.prisma.guest.findMany({ where: { propertyId }, orderBy: { lifetimeValue: 'desc' } });
    const scored = guests.map((g) => ({
      id: g.id,
      name: `${g.firstName} ${g.lastName}`,
      email: g.email,
      tier: g.loyaltyTier,
      isVip: g.isVip,
      totalStays: g.totalStays,
      lifetimeValue: Number(g.lifetimeValue),
      lastStayAt: g.lastStayAt,
      ...this.scoreGuest(g),
    }));
    const by = (r: string) => scored.filter((s) => s.churnRisk === r).length;
    return {
      summary: {
        total: scored.length,
        high: by('HIGH'), medium: by('MEDIUM'), low: by('LOW'), new: by('NEW'),
        currentLtv: scored.reduce((s, x) => s + x.lifetimeValue, 0),
        projectedLtv: scored.reduce((s, x) => s + x.ltvProjection, 0),
      },
      atRisk: scored.filter((s) => s.churnRisk === 'HIGH').sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, 8),
      topValue: scored.slice(0, 8),
    };
  }

  // ── AI CRM: campaign copy generation + drafts ───────────────────────────────
  async generateCampaign(propertyId: string, dto: GenerateCampaignDto) {
    const { segments } = await this.segments(propertyId);
    const seg = segments.find((s) => s.key === dto.segment);
    const audienceCount = seg?.count ?? 0;
    const property = await this.prisma.property.findFirst({ where: { id: propertyId }, select: { name: true, city: true } });
    const label = seg?.label ?? 'valued';
    const goal = dto.goal?.trim() || 'win the guest back with a direct-booking offer';

    if (!this.ai) {
      return {
        subject: `A special offer for our ${label} guests`,
        body: `Dear guest,\n\nWe'd love to welcome you back to ${property?.name ?? 'our hotel'}. As one of our ${label.toLowerCase()} guests, enjoy an exclusive rate on your next stay when you book directly with us.\n\nWarm regards,\nThe ${property?.name ?? 'Hotel'} Team`,
        audienceCount,
        live: false,
      };
    }

    const prompt =
      `Write a short marketing email for ${property?.name} (a hotel in ${property?.city}). ` +
      `Audience: "${seg?.label}" — ${seg?.description}. Goal: ${goal}. ` +
      `Return strict JSON {"subject": string, "body": string}. ` +
      `Body 60-110 words, warm and specific, one clear call-to-action to book direct. ` +
      `Do NOT use placeholders like [Name] or [Hotel] — write finished copy.`;
    const resp = await this.ai.chat.completions.create({
      model: this.aiModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    let parsed: { subject?: string; body?: string } = {};
    try { parsed = JSON.parse(resp.choices[0].message.content || '{}'); } catch { /* noop */ }
    return { subject: parsed.subject ?? '', body: parsed.body ?? '', audienceCount, live: true };
  }

  async createCampaign(propertyId: string, dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        propertyId,
        name: dto.name,
        segment: dto.segment,
        subject: dto.subject ?? null,
        body: dto.body,
        audienceCount: dto.audienceCount ?? 0,
      },
    });
  }

  async listCampaigns(propertyId: string) {
    return this.prisma.campaign.findMany({ where: { propertyId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async addLoyaltyPoints(guestId: string, points: number, description: string, referenceId?: string) {
    const [txn] = await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: { guestId, points, type: points > 0 ? 'EARN' : 'REDEEM', description, referenceId },
      }),
      this.prisma.guest.update({
        where: { id: guestId },
        data: { loyaltyPoints: { increment: points } },
      }),
    ]);
    return txn;
  }
}
