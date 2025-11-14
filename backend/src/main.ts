import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Global prefix
    app.setGlobalPrefix('api');

    // CORS
    const corsOrigin = configService.get('cors.origin');
    console.log(`[Bootstrap] CORS Origin: ${corsOrigin}`);
    app.enableCors({
      origin: corsOrigin,
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
      .addTag('Clubs', 'Club management endpoints')
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
    const host = '0.0.0.0'; // Слушаем на всех интерфейсах для доступности через localhost и 127.0.0.1
    
    console.log(`[Bootstrap] Starting server on ${host}:${port}...`);
    console.log(`[Bootstrap] Environment: ${configService.get('nodeEnv')}`);
    console.log(`[Bootstrap] Database URL: ${configService.get('database.url') ? 'configured' : 'NOT CONFIGURED'}`);
    
    await app.listen(port, host);

    console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║   🎓 MNU Events API Server                               ║
  ║                                                          ║
  ║   Server running on: http://localhost:${port}           ║
  ║   Server running on: http://127.0.0.1:${port}          ║
  ║   API Documentation: http://localhost:${port}/api/docs  ║
  ║   Environment: ${configService.get('nodeEnv')}                       ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
    
    console.log(`[Bootstrap] ✅ Server successfully started and listening on ${host}:${port}`);
  } catch (error) {
    console.error('[Bootstrap] ❌ Failed to start server:', error);
    
    if (error instanceof Error) {
      console.error('[Bootstrap] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      // Проверяем типичные ошибки
      if (error.message?.includes('EADDRINUSE')) {
        console.error('[Bootstrap] Port is already in use. Please stop the process using port 3001 or change PORT in .env');
      } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('database')) {
        console.error('[Bootstrap] Database connection failed. Make sure PostgreSQL is running: docker-compose up -d');
      }
    }
    
    process.exit(1);
  }
}

bootstrap();
