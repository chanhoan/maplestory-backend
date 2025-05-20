import { Controller, Delete, HttpStatus, Param, Post, HttpCode } from '@nestjs/common';
import { EventSagaService } from '../service/event.saga.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * 이벤트 삭제 및 복구 SAGA 엔드포인트를 제공하는 컨트롤러입니다.
 * - 사용자 단위로 연관된 이벤트를 soft‑delete하거나 복구합니다.
 */
@ApiTags('Events/Saga')
@Controller('/api/events')
export class EventSagaController {
  constructor(private readonly eventSagaService: EventSagaService) {}

  /**
   * 지정된 사용자와 연관된 모든 이벤트를 soft‑delete 처리합니다.
   *
   * @param userId - soft‑delete 대상 사용자 ID
   */
  @ApiOperation({ summary: '이벤트 소프트 삭제' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '이벤트 소프트 삭제 성공',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:userId')
  async deleteByUser(@Param('userId') userId: string): Promise<void> {
    await this.eventSagaService.softDeleteByUser(userId);
  }

  /**
   * soft‑delete된 사용자의 이벤트를 모두 복구합니다.
   *
   * @param userId - 복구 대상 사용자 ID
   */
  @ApiOperation({ summary: '이벤트 복구' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '이벤트 복구 성공',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:userId/restore')
  async restoreByUser(@Param('userId') userId: string): Promise<void> {
    await this.eventSagaService.restoreByUser(userId);
  }
}
