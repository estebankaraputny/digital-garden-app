import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.setGlobalPrefix('api/v1');



  //  const options = new DocumentBuilder()
  //   .setTitle('Digital Garden API')
  //   .setDescription('The Digital Garden API description')
  //   .setVersion('1.0')
  //   .addBearerAuth({
  //     type: 'http',
  //     scheme: 'bearer',
  //     bearerFormat: 'JWT',
  //     in: 'header',
  //     name: 'Authorization',
  //     description: 'enter your JWT token',
  //   },'bearer')
  //   // .addSecurityRequirements('bearer')
  //   .build();
  // const document = SwaggerModule.createDocument(app, options);
  // SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();