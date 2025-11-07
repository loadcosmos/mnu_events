import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: true,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MNU Events API')
    .setDescription('University Events Management Platform API')
    .setVersion('1.0')
    .addTag('Authentication', 'Auth endpoints (register, login, verify email)')
    .addTag('Users', 'User management endpoints')
    .addTag('Events', 'Event management endpoints')
    .addTag('Registrations', 'Event registration endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get('port') || 3001;
  await app.listen(port);

  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║   🎓 MNU Events API Server                               ║
  ║                                                          ║
  ║   Server running on: http://localhost:${port}           ║
  ║   API Documentation: http://localhost:${port}/api/docs  ║
  ║   Environment: ${configService.get('nodeEnv')}                       ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
