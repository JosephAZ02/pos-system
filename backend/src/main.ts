import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

    const app = await NestFactory.create(AppModule);

    app.enableCors();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (errors) => {
                // Extrae todos los mensajes de error de los DTOs
                const messages = errors.map((error) => {
                    return Object.values(error.constraints || {}).join(', ');
                });

                // Lanza un BadRequest con la lista de mensajes
                return new BadRequestException(messages);
            },
        }),
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Sistema POS')
        .setDescription('Documentación de la API REST del Sistema POS')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, document);

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

}

void bootstrap();
