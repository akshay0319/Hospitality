import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto, paginate } from '@/common/dto/pagination.dto';

const USER_SELECT = {
  id: true, email: true, firstName: true, lastName: true,
  phone: true, role: true, department: true, isActive: true,
  avatarUrl: true, lastLoginAt: true, propertyId: true, tenantId: true,
  createdAt: true, updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const where = {
      tenantId,
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search } },
          { lastName: { contains: query.search } },
          { email: { contains: query.search } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, select: USER_SELECT,
        skip: query.skip, take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginate(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId }, select: USER_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Email already in use');

    const password = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { ...dto, email: dto.email.toLowerCase(), password, tenantId },
      select: USER_SELECT,
    });
  }

  async update(id: string, tenantId: string, dto: UpdateUserDto) {
    await this.findOne(id, tenantId);
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
  }

  async deactivate(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.user.update({ where: { id }, data: { isActive: false }, select: USER_SELECT });
  }
}
