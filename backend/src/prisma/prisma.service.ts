import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { parseJsonFields } from './json-fields';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

    // Transparently parse JSON-text fields (former PostgreSQL arrays/Json) on read.
    this.$use(async (params, next) => {
      const result = await next(params);
      return parseJsonFields(params.model, result);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /** Test helper — wipes all data (MySQL/MariaDB). Never runs in production. */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }
    const rows = await this.$queryRaw<{ TABLE_NAME: string }[]>`
      SELECT TABLE_NAME FROM information_schema.tables
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
    `;
    await this.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
    for (const { TABLE_NAME } of rows) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE \`${TABLE_NAME}\`;`);
    }
    await this.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  }
}
