import { Injectable, NestMiddleware } from '@nestjs/common';
import * as ua from 'universal-analytics';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config';
import { IAnalyticsConfig } from 'src/config';

@Injectable()
export class AnalyticsMiddleware implements NestMiddleware {
    constructor(
        private configService: ConfigService<AllConfigType>,
    ){}
    private readonly measurement_id = this.configService.get<IAnalyticsConfig>('analytics').measurement_id;
  use(req: any, res: any, next: () => void) {
    const visitor = ua(this.measurement_id);
    visitor.event({
      ec: 'API Usage',
      ea: req.method, 
      el: req.originalUrl,
    }).send();

    next();
  }
}
