import "dotenv/config";

import compression from "compression";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerModule,
} from "@nestjs/swagger";

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.setGlobalPrefix("api");


  app.use(helmet());
  app.use(compression());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Bangladesh Restaurant API")
    .setDescription(
      "Restaurant Ordering & Management System API",
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup("docs", app, document);

  const port = Number(process.env.PORT ?? 4000);

  await app.listen(port);

  console.log(
    `Restaurant API running at http://localhost:${port}/api`,
  );

  console.log(
    `Swagger running at http://localhost:${port}/docs`,
  );
}

bootstrap();

