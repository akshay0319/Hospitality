import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshTokenDto, userId: string): Promise<{
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
    changePassword(userId: string, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<void>;
}
