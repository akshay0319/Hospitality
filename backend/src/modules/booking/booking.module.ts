import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { ReservationsModule } from '@/modules/reservations/reservations.module';

@Module({
  imports: [ReservationsModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
