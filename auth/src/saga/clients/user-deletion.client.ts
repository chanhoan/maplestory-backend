import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { ConfigService } from '@nestjs/config';

interface ServiceConfig {
  url: string;
}

/**
 * 유저 삭제 SAGA 진행 시, 연관된 다른 마이크로서비스(이벤트 서비스)에
 * 삭제 및 복구 HTTP 요청을 보내는 클라이언트입니다.
 */
@Injectable()
export class UserDeletionSagaClient {
  private readonly services: Record<string, ServiceConfig>;
  private readonly logger = new Logger(UserDeletionSagaClient.name);

  /**
   * @param httpService - NestJS의 HTTP 모듈
   * @param configService - 애플리케이션 설정 관리 모듈
   * @throws Error 'services' 설정이 없는 경우
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const svc =
      this.configService.get<Record<string, ServiceConfig>>('services');
    if (!svc) {
      throw new Error(`[UserDeletionSagaClient] 'services' 설정이 없습니다.`);
    }
    this.services = svc;
  }

  /**
   * 지정된 유저ID에 대해 이벤트 서비스의 리소스를 완전 삭제 요청합니다.
   *
   * @param userId - 삭제 대상 유저의 고유 ID
   * @throws InternalServerErrorException HTTP 요청 실패 시
   */
  async deleteEventByUser(userId: string): Promise<void> {
    const url = `${this.services['events'].url}/api/events/${userId}`;
    this.logger.log(`DELETE 요청 → ${url}`);
    try {
      await firstValueFrom(
        this.httpService.delete(url).pipe(
          catchError((err) => {
            this.logger.error(`Failed deleteEventByUser: ${err.message}`);
            return throwError(
              () => new InternalServerErrorException('Event 삭제 실패'),
            );
          }),
        ),
      );
      this.logger.log(`Event for user(${userId}) deleted.`);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 지정된 유저ID에 대해 이벤트 서비스의 리소스를 복구 요청합니다.
   *
   * @param userId - 복구 대상 유저의 고유 ID
   * @throws InternalServerErrorException HTTP 요청 실패 시
   */
  async restoreEventByUser(userId: string): Promise<void> {
    const url = `${this.services['events'].url}/api/events/${userId}/restore`;
    this.logger.log(`POST 요청 → ${url}`);
    try {
      await firstValueFrom(
        this.httpService.post(url).pipe(
          catchError((err) => {
            this.logger.error(`Failed restoreEventByUser: ${err.message}`);
            return throwError(
              () => new InternalServerErrorException('Event 복구 실패'),
            );
          }),
        ),
      );
      this.logger.log(`Event for user(${userId}) restored.`);
    } catch (e) {
      throw e;
    }
  }
}
