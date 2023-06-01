import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // esta flag es para que automaticamente se nos saquen las properties extras que no estan definidas en el DTO
  // Ejemplo: Dto tiene email de tipo string y la request trae un email y una password.
  // Bueno esa password se saca del body automaticamente
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const config = app.get<ConfigService<EnvVariables>>(ConfigService);
  const PORT = config.get('PORT', { infer: true });
  await app.listen(PORT);
}
bootstrap();
