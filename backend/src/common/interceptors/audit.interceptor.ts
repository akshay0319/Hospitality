import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!writeMethods.includes(method) || !user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const entity = url.split('/')[3] ?? 'unknown';
          await this.prisma.auditLog.create({
            data: {
              propertyId: user.propertyId ?? user.tenantId,
              userId: user.id,
              action: method,
              entity,
              entityId: (data as Record<string, string>)?.id,
              afterState: data != null ? JSON.stringify(data) : null,
              ipAddress: ip,
              userAgent: headers['user-agent'],
            },
          });
        } catch {
          // Audit log failure should never break the main flow
        }
      }),
    );
  }
}
