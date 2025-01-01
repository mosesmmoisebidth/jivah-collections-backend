import { Module } from '@nestjs/common';
import { TokenRepository } from './model/token.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './model/token.entity';
import { TokensService } from './token.service';
import { ResponseService } from 'src/shared/response/response.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  providers: [TokensService, ResponseService, TokenRepository],
  exports: [TokensService, TokenRepository],
})
export class TokensModule {}
