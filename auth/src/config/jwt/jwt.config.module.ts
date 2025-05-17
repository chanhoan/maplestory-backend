import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService): JwtModuleOptions => {
        const { secretKey, expiresIn } = cs.get<{
          secretKey: Buffer;
          expiresIn: string;
        }>('jwt')!;
        return {
          secret: secretKey,
          signOptions: { algorithm: 'HS256', expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [JwtModule],
})
export class JWTConfigModule {}
