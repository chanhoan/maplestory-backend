import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
