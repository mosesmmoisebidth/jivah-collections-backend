import { ApiProperty } from '@nestjs/swagger';

export class LoginLogDto {
  @ApiProperty({ description: 'Log ID' })
  id: string;

  @ApiProperty({ description: 'Login IP', example: '1.1.1.1' })
  ip: string;

  @ApiProperty({ description: 'Login Address' })
  address: string;

  @ApiProperty({ description: 'Operating System', example: 'Windows 10' })
  os: string;

  @ApiProperty({ description: 'Browser', example: 'Chrome' })
  browser: string;

  @ApiProperty({ description: 'Username', example: 'admin' })
  username: string;

  @ApiProperty({
    description: 'Login Time',
    example: '2023-12-22 16:46:20.333843',
  })
  time: Date;
}
