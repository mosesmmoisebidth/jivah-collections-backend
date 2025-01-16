import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './model/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ResetPasswordService } from '../reset-password/reset-password.service';
import { OTPModule } from '../otp/otp.module';
import { RoleRepository } from '../roles/model/role.repository';
import { ResetPasswordModule } from '../reset-password/reset-password.module';
import { UserRepository } from './model/users.repository';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    OTPModule,
    ResetPasswordModule,
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, ResetPasswordService, RoleRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}