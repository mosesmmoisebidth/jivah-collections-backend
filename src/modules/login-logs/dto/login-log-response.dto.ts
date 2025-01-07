import { ApiProperty } from '@nestjs/swagger';
import { LoginLogDto } from './login-log.dto';

export class LoginLogResponseDto {
  @ApiProperty({ type: LoginLogDto })
  loginLog: LoginLogDto;
}

export class LoginLogsResponseDto {
  @ApiProperty({ type: [LoginLogDto] })
  loginLog: LoginLogDto[];
}
