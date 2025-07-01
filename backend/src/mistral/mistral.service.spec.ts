import { Test, TestingModule } from '@nestjs/testing';
import { MistralService } from './mistral.service';

describe('MistralService', () => {
  let service: MistralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MistralService],
    }).compile();

    service = module.get<MistralService>(MistralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Note: Ces tests nécessitent une clé API valide
  // Ils peuvent être marqués comme skip en développement
});
