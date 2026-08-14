"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = __importDefault(require("./config/configuration"));
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const properties_module_1 = require("./modules/properties/properties.module");
const rooms_module_1 = require("./modules/rooms/rooms.module");
const guests_module_1 = require("./modules/guests/guests.module");
const reservations_module_1 = require("./modules/reservations/reservations.module");
const housekeeping_module_1 = require("./modules/housekeeping/housekeeping.module");
const maintenance_module_1 = require("./modules/maintenance/maintenance.module");
const revenue_module_1 = require("./modules/revenue/revenue.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const context_module_1 = require("./modules/context/context.module");
const ai_module_1 = require("./modules/ai/ai.module");
const booking_module_1 = require("./modules/booking/booking.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            properties_module_1.PropertiesModule,
            rooms_module_1.RoomsModule,
            guests_module_1.GuestsModule,
            reservations_module_1.ReservationsModule,
            housekeeping_module_1.HousekeepingModule,
            maintenance_module_1.MaintenanceModule,
            revenue_module_1.RevenueModule,
            dashboard_module_1.DashboardModule,
            analytics_module_1.AnalyticsModule,
            context_module_1.ContextModule,
            ai_module_1.AiModule,
            booking_module_1.BookingModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map