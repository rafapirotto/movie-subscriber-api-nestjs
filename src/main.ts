import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // esta flag es para que automaticamente se nos saquen las properties extras que no estan definidas en el DTO
  // Ejemplo: Dto tiene email de tipo string y la request trae un email y una password.
  // Bueno esa password se saca del body automaticamente
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
}
bootstrap();
