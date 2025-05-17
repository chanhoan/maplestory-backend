import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { ConfigService } from '@nestjs/config';

interface ServiceConfig {
  url: string;
}

@Injectable()
export class UserDeletionSagaClient {
  private readonly services: Record<string, ServiceConfig>;

  private readonly logger = new Logger(UserDeletionSagaClient.name);

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

  async deleteEventByUser(username: string): Promise<void> {
    const url = `${this.services['events'].url}/delete/${username}`;
    try {
      await firstValueFrom(
        this.httpService.delete(url).pipe(
          catchError((err) => {
            this.logger.error(`Failed deletePostsByUser: ${err.message}`);
            throw new InternalServerErrorException('Posts 삭제 실패');
          }),
        ),
      );
      this.logger.log(`Posts for user(${username}) deleted.`);
    } catch (e) {
      throw e;
    }
  }

  async restoreEventByUser(username: string): Promise<void> {
    const url = `${this.services['events'].url}/restore/${username}`;

    try {
      await firstValueFrom(
        this.httpService.post(url).pipe(
          catchError((err) => {
            this.logger.error(`Failed restoreEventByUser: ${err.message}`);
            throw new InternalServerErrorException('Event 복구 실패');
          }),
        ),
      );
      this.logger.log(`Events for user(${username}) restored.`);
    } catch (e) {
      throw e;
    }
  }
}
