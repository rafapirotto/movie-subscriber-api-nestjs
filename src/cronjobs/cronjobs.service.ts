import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronjobsService {
  private readonly logger = new Logger(CronjobsService.name);
  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.logger.log(`Checked for movies at ${new Date()}`);
  }
}
