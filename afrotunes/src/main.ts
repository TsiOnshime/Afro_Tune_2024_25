import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cloudinary from 'cloudinary';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials'
    ],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
  });

  // Cloudinary configuration
  cloudinary.v2.config({
    cloud_name: 'dcixfqemc',
    api_key: '443894683639552',
    api_secret: 'bhj1-SWNgJSdjnFZE7Yv0jFqTMs',
  });

  const config = new DocumentBuilder()
    .setTitle('AfrotuneAPI')
    .setDescription('API documentation for the Students service')
    .setVersion('1.0')
    .addBearerAuth() // Add this line to enable bearer token authentication
    .addTag('students')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3006);
}
bootstrap();
