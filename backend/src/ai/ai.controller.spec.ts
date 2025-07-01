import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { MistralService } from '../mistral/mistral.service';

describe('AiController', () => {
  let controller: AiController;
  let mistralService: MistralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: MistralService,
          useValue: {
            generateRecipe: jest.fn(),
            generateNutritionAnalysis: jest.fn(),
            improveRecipe: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    mistralService = module.get<MistralService>(MistralService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
