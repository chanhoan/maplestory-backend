import { Test, TestingModule } from '@nestjs/testing';
import { EventSagaController } from './event.saga.controller';
import { EventSagaService } from './event.saga.service';

describe('EventSagaController', () => {
  let controller: EventSagaController;
  let service: Partial<Record<keyof EventSagaService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      softDeleteByUser: jest.fn().mockResolvedValue(undefined),
      restoreByUser: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventSagaController],
      providers: [{ provide: EventSagaService, useValue: service }],
    }).compile();

    controller = module.get<EventSagaController>(EventSagaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteByUser', () => {
    it('should call softDeleteByUser with userId', async () => {
      const userId = 'user1';
      await controller.deleteByUser(userId);
      expect(service.softDeleteByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('restoreByUser', () => {
    it('should call restoreByUser with userId', async () => {
      const userId = 'user1';
      await controller.restoreByUser(userId);
      expect(service.restoreByUser).toHaveBeenCalledWith(userId);
    });
  });
});
