import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { SecurityModule } from "./security/security.module";
import { GatewayModule } from "./gateway/gateway.module";

@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [configuration],
      }),
      SecurityModule,
      GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
