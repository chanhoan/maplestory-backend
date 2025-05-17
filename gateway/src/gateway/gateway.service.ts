import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import { Request } from 'express';
interface ServiceConfig {
  url: string;
}

@Injectable()
export class GatewayService {
  private readonly services: Record<string, ServiceConfig>;

  constructor(private readonly configService: ConfigService) {
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
  async forward(
    req: Request,
    overrideServiceKey?: string,
  ): Promise<{ status: number; data: any }> {
    const serviceKey = overrideServiceKey ?? this.matchServiceKey(req.path);
    const service = this.services[serviceKey];

    const missingUrl = !service || !service.url;

    if (missingUrl) {
      throw new BadRequestException(
        `서비스 URL이 지정되지 않았습니다: ${serviceKey}`,
      );
    }

    const target = `${service.url}${req.originalUrl}`;

    const user = (req as any).user as
      | { username: string; role: string; expiresIn: number; jti: string }
      | undefined;

    const headers: Record<string, any> = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['keep-alive'];
    delete headers['transfer-encoding'];
    delete headers['content-length'];

    if (user) {
      const userInfo = {
        username: user.username,
        role: user.role,
        expiresIn: user.expiresIn,
        jti: user.jti,
      };
      headers['x-forwarded-user'] = encodeURIComponent(
        JSON.stringify(userInfo),
      );
    }

    const axiosConfig: AxiosRequestConfig = {
      method: req.method as AxiosRequestConfig['method'],
      url: target,
      headers,
      data: req.body,
      validateStatus: () => true,
    };
    try {
      const response = await axios.request(axiosConfig);
      return { status: response.status, data: response.data };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `서비스 경로: ${serviceKey} / 요청 Proxy에 실패하였습니다: ${err.message}`,
      );
    }
  }
}
