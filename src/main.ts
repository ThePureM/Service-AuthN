import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

import { Environment, MainConfiguration } from './common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configuration = app.get<MainConfiguration>(ConfigService);
  const { environment, port, hostname, proxy } = configuration;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  switch (environment) {
    case Environment.Production:
      if (proxy) app.set('trust proxy', proxy);

      app.disable('x-powered-by');

      break;
    case Environment.Development:
      app.enable('trust proxy');

      app.disable('view cache');

      break;
  }

  app.useStaticAssets(path.join(__dirname, '..', 'public'));
  app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
  app.use(
    '/css/bootstrap',
    app.useStaticAssets(path.join(__dirname, '..', 'node_modules/bootstrap')),
  );
  app.setViewEngine('ejs');

  app.enableShutdownHooks();

  await app.listen(port, hostname, () => {
    Logger.log(`Application is running on: ${hostname}:${port}`, 'Bootstrap');
  });
}
bootstrap();
