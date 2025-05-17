import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { EventGatewayController } from './event.gateway.controller';
import { AuthGatewayController } from './auth.gateway.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  controllers: [AuthGatewayController, EventGatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
