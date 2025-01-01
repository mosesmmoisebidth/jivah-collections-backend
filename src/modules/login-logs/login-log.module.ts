import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginLogEntity } from './model/login-log.entity';
import { LoginLogController } from './login-log.controller';
import { LoginLogService } from './login-log.service';
import { LoginLogRepository } from './model/login-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LoginLogEntity])],
  controllers: [LoginLogController],
  providers: [LoginLogService, LoginLogRepository],
  exports: [LoginLogService, LoginLogRepository],
})
export class LoginLogsModule {}
