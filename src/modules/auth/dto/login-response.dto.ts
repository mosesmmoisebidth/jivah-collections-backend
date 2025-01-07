import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/modules/users/dto/user-dto';
import { TokenDto } from 'src/modules/tokens/dto/token-dto';

export class LoginResponseDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;
  @ApiProperty({ type: TokenDto })
  tokens: TokenDto;
}
