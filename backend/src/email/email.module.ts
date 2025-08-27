import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NewsletterController } from './newsletter.controller';

@Module({
  controllers: [NewsletterController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
