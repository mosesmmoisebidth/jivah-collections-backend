import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths, IAppConfig, SwaggerConfig } from './config';
import { LoggerService } from './shared/logger/logger.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import validationOptions from './common/validator/options.validator';
import * as compression from 'compression';
import * as helmet from 'helmet';
import cluster from 'cluster';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/http/http-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: false,
    });

    const configService = app.get(ConfigService<ConfigKeyPaths>);
    const { apiPrefix, port } = configService.get<IAppConfig>('app');
    app.use(helmet());
    app.use(compression());
    console.log("enabling cors")
    app.use((req, res, next) => {
      const allowedOrigins = ['http://localhost:3000', 'https://jivah.vercel.app'];
      const origin = req.headers.origin;
    
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        if (req.method === 'OPTIONS') {
          return res.status(204).send(); // Preflight response with no content
        }
      }

      next();
    });    
    app.use(cookieParser());
    app.enableVersioning();
    console.log("Added Some Consoles");
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe(validationOptions));
    app.setGlobalPrefix(apiPrefix);
    SwaggerConfig(app, configService);
    try {
      await app.listen(port, async () => {
        app.useLogger(app.get(LoggerService));
        const url = await app.getUrl();
        const { pid } = process;
        const env = cluster?.isPrimary;
        const prefix = env ? 'P' : 'W';
        const logger = new Logger('NestApplication');
        logger.log(`[${prefix + pid}] Server running on ${url}`);
      });
    } catch (error) {
      console.error('Error during app.listen:', error);
    }
  } catch (error) {
    console.error('Error during bootstrap:', error);
  }
}

bootstrap();
