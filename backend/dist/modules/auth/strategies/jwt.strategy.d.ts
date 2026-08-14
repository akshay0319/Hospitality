import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    tenantId: string;
    propertyId: string | null;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        tenantId: string;
        propertyId: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
    }>;
}
export {};
