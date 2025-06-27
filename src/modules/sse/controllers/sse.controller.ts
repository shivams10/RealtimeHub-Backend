import { Controller } from '@nestjs/common';
import { SseService } from '@modules/sse/services/sse.service';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}
}
