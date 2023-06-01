import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DEFAULT_PUSHOVER_PRIORITY } from 'src/subscriptions/constants';
import { Priority } from 'src/subscriptions/types';
import { PushoverDevice } from './types';
import { EnvVariables } from 'src/common';
import { PUSHOVER_BASE_URL } from './constants';

@Injectable()
export class NotificationsService {
  constructor(private configService: ConfigService<EnvVariables>) {}
  private readonly logger = new Logger(NotificationsService.name);
  async send(
    // https://stackoverflow.com/questions/17186566/how-do-i-fix-error-ts1015-parameter-cannot-have-question-mark-and-initializer
    title: string,
    message: string,
    priority: Priority = DEFAULT_PUSHOVER_PRIORITY,
    device: PushoverDevice = PushoverDevice.IPHONE_RAFA
  ): Promise<void> {
    const user = this.configService.get('PUSHOVER_USER_KEY');
    const token = this.configService.get('PUSHOVER_APPLICATION_KEY');
    const data = {
      token,
      user,
      device,
      title,
      message,
      priority,
      ...(priority === Priority.EMERGENCY && { retry: 30, expire: 600 }),
    };
    try {
      await fetch(PUSHOVER_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.logger.log('Notification sent with the following data:', {
        ...data,
        user,
        token,
      });
    } catch (error) {
      this.logger.error('Error in the send method with these params:', {
        priority,
        device,
        message,
        title,
      });
    }
  }
}
