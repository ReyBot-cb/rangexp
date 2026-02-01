import "reflect-metadata";
import { ValidationPipe, VersioningType, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("RangeXp API")
    .setDescription("Gamified diabetes self-management API")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, "0.0.0.0");
  console.log(`RangeXp API running on http://0.0.0.0:${port}/v1 (docs: /docs)`);
}
bootstrap();
