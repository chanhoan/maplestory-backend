// src/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('healthCheck', () => {
    it('올바른 헬스체크 응답 객체를 반환해야 한다', () => {
      const result = appController.healthCheck();

      // 고정 필드 검사
      expect(result).toMatchObject({
        status: 'ok',
        message: '서버 정상 작동 중',
      });

      // timestamp 필드가 ISO 8601 형식의 문자열인지 검사
      expect(typeof result.timestamp).toBe('string');
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });
  });
});
