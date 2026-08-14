import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, query: PaginationDto): Promise<{
        data: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
            tenantId: string;
            propertyId: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            department: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        id: string;
        tenantId: string;
        propertyId: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        department: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(tenantId: string, dto: CreateUserDto): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        id: string;
        tenantId: string;
        propertyId: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        department: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, tenantId: string, dto: UpdateUserDto): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        id: string;
        tenantId: string;
        propertyId: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        department: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deactivate(id: string, tenantId: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        id: string;
        tenantId: string;
        propertyId: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        department: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
