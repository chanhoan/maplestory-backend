import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { catchError, firstValueFrom, map } from 'rxjs';

interface ServiceConfig {
  url: string;
}

@Injectable()
export class GatewayService {
  private readonly services: Record<string, ServiceConfig>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.services =
      this.configService.get<Record<string, ServiceConfig>>('services');
  }

  /**
   * 주어진 경로를 기반으로 서비스 키를 매칭합니다.
   * @param path 요청 경로
   * @returns 매칭된 서비스 키
   */
  private matchServiceKey(path: string): string {
    const segments = path.split('/').filter(Boolean);
    const key = segments[0];

    if (!this.services[key]) {
      throw new BadRequestException(`알수없는 경로입니다: ${key}`);
    }

    return key;
  }

  /**
   * 요청을 적절한 서비스로 전달합니다.
   * @param req Express 요청 객체
   * @param overrideServiceKey 서비스 키를 덮어쓰기 위한 선택적 매개변수
   * @returns 서비스 응답 상태와 데이터를 포함하는 객체
   */
  async forward(req: Request, overrideServiceKey?: string) {
    const key = overrideServiceKey ?? this.matchServiceKey(req.path);
    const base = this.services[key].url;
    const url = `${base}${req.url}`;

    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    const user = (req as any).user;
    if (user) {
      headers['x-forwarded-user'] = encodeURIComponent(
        JSON.stringify({
          userId: user.userId,
          username: user.username,
          role: user.role,
          expiresIn: user.expiresIn,
          jti: user.jti,
        }),
      );
    }

    return firstValueFrom(
      this.httpService
        .request({
          method: req.method,
          url,
          data: req.body,
          headers,
          validateStatus: () => true,
        })
        .pipe(
          map((resp) => {
            const { status, data } = resp;
            if (status < 200 || status >= 300) {
              throw new HttpException(data, status);
            }
            return { status, data };
          }),
          catchError((err) => {
            if (err instanceof HttpException) {
              throw err;
            }
            throw new InternalServerErrorException(
              `Proxy 실패 (${key}): ${err.message}`,
            );
          }),
        ),
    );
  }
}
