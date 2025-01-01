import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards';
import { TokensModule } from '../tokens/token.module';
import { LoginLogsModule } from '../login-logs/login-log.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { RolesModule } from '../roles/roles.module';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    LoginLogsModule,
    UsersModule,
    FirebaseModule,
    TokensModule,
    RolesModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PermissionsGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass:PermissionsGuard 
    }
  ],
})
export class AuthModule {}
