import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    const slug = await this.generateUniqueSlug(dto.companyName);
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const owner = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: dto.companyName, slug, plan: 'trial' },
      });

      const property = await tx.property.create({
        data: {
          tenantId: tenant.id,
          name: dto.propertyName,
          brand: dto.propertyType ?? null,
          starRating: dto.starRating,
          address: dto.address,
          city: dto.city,
          state: dto.state ?? null,
          country: dto.country ?? 'India',
          currency: dto.currency ?? 'INR',
          phone: dto.propertyPhone ?? null,
          totalRooms: dto.totalRooms,
        },
      });

      return tx.user.create({
        data: {
          tenantId: tenant.id,
          propertyId: property.id,
          email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone ?? null,
          role: 'OWNER',
          department: 'Management',
        },
        include: { property: { select: { id: true, name: true, city: true } } },
      });
    });

    const tokens = await this.generateTokens(owner);
    await this.prisma.user.update({
      where: { id: owner.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
        lastLoginAt: new Date(),
      },
    });

    const { password: _p, refreshToken: _r, ...safeUser } = owner;
    return { user: safeUser, ...tokens, isNewAccount: true };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base =
      name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ||
      'tenant';
    let slug = base;
    // Append a short suffix until unique.
    while (await this.prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    }
    return slug;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { property: { select: { id: true, name: true, city: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
        lastLoginAt: new Date(),
      },
    });

    const { password: _, refreshToken: __, ...safeUser } = user;

    return {
      user: safeUser,
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        tenantId: true,
        propertyId: true,
        avatarUrl: true,
        lastLoginAt: true,
        property: {
          select: { id: true, name: true, city: true, currency: true, timezone: true },
        },
      },
    });

    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }

  private async generateTokens(user: { id: string; email: string; role: string; tenantId: string; propertyId: string | null }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      propertyId: user.propertyId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: this.config.get<string>('jwt.expiresIn'),
      }),
      this.jwt.signAsync(
        { sub: user.id },
        {
          secret: this.config.get<string>('jwt.refreshSecret'),
          expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
