import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        isNewAccount: boolean;
        accessToken: string;
        refreshToken: string;
        user: {
            property: {
                name: string;
                city: string;
                id: string;
            } | null;
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
        };
    }>;
    private generateUniqueSlug;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            property: {
                name: string;
                city: string;
                id: string;
            } | null;
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
        };
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
    getMe(userId: string): Promise<{
        property: {
            name: string;
            city: string;
            currency: string;
            id: string;
            timezone: string;
        } | null;
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        tenantId: string;
        propertyId: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        department: string | null;
        lastLoginAt: Date | null;
        avatarUrl: string | null;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    private generateTokens;
}
