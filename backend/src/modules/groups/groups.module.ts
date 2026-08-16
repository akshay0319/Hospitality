import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { ReservationsModule } from '@/modules/reservations/reservations.module';

@Module({
  imports: [ReservationsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
