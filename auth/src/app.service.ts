import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * 서버의 상태를 확인하는 메서드
   * @returns 서버 상태 정보 (상태, 메시지, 타임스탬프)
   */
  getHealth(): { status: string; message: string; timestamp: string } {
    return {
      status: 'ok',
      message: '서버 정상 작동 중',
      timestamp: new Date().toISOString(),
    };
  }
}
