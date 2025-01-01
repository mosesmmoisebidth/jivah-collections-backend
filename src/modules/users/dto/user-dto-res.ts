import { BaseDto } from "src/common/dtos/base.dto";
import { ApiProperty } from "@nestjs/swagger";
import { UserStatus } from "src/modules/auth/enums/user-status.enum";
export class UserResDto extends BaseDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  profilePhoto: string[];

  @ApiProperty()
  status: UserStatus;
}