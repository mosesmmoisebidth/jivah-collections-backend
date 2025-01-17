import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  refresh_expiresAt: Date;
}
