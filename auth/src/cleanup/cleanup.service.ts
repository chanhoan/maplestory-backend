import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

/**
 * soft‑deleted 된 Mongoose 문서 중
 * deletedAt이 30일 지난 것들을 매일 자정에
 * 하드 삭제(hard delete) 하는 스케줄러 서비스입니다.
 */
@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  /**
   * @param connection - Mongoose 커넥션 (전체 모델 순회를 위해 주입)
   */
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  /**
   * 매일 자정(00:00)에 실행됩니다.
   * deletedAt 필드가 30일 이전인 모든 문서를 삭제합니다.
   */
  @Cron('0 0 * * *')
  async handleCleanup() {
    // 30일 전 시각 계산
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 등록된 모든 모델을 순회하면서 deletedAt이 있으면 삭제 쿼리 실행
    for (const modelName of this.connection.modelNames()) {
      const model = this.connection.model<any>(modelName);

      // deletedAt 컬럼이 없는 모델은 건너뜀
      if (!model.schema.path('deletedAt')) continue;

      const { deletedCount } = await model
        .deleteMany({ deletedAt: { $lte: threshold } })
        .exec();

      if (deletedCount > 0) {
        this.logger.log(
          `모델 '${modelName}'에서 deletedAt ≤ ${threshold.toISOString()} 문서 ${deletedCount}건을 하드 삭제했습니다.`,
        );
      }
    }
  }
}
