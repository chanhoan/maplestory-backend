import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { EventGatewayController } from './event.gateway.controller';
import { AuthGatewayController } from './auth.gateway.controller';

@Module({
  imports: [],
  controllers: [AuthGatewayController, EventGatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
