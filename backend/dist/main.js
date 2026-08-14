"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('port') ?? 4000;
    const prefix = config.get('apiPrefix') ?? 'api/v1';
    const frontendUrl = config.get('frontendUrl') ?? 'http://localhost:3000';
    const isDev = config.get('nodeEnv') === 'development';
    app.use((0, helmet_1.default)({ crossOriginEmbedderPolicy: false }));
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.setGlobalPrefix(prefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    if (isDev) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('HospitalityOS AI — API')
            .setDescription('Complete REST API for the HospitalityOS AI platform.\n\n' +
            '**Auth:** Use `POST /api/v1/auth/login` to get a JWT token, then click Authorize.')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('Auth', 'Authentication & session management')
            .addTag('Dashboard', 'KPIs and live operations summary')
            .addTag('Reservations', 'Full reservation lifecycle — create, modify, check-in, check-out')
            .addTag('Rooms', 'Room inventory, status, and calendar')
            .addTag('Guests', 'Guest profiles and CRM')
            .addTag('Housekeeping', 'Task management and AI optimizer')
            .addTag('Revenue', 'Rate plans, rate grid, and AI recommendations')
            .addTag('Analytics', 'Revenue trends, channel breakdown, occupancy heatmap')
            .addTag('Users', 'Staff management')
            .addTag('Properties', 'Property and room type configuration')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
        common_1.Logger.log(`Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
    }
    await app.listen(port);
    common_1.Logger.log(`🚀 HospitalityOS AI Backend running on http://localhost:${port}/${prefix}`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map