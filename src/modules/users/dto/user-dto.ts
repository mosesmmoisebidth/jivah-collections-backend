import { ApiProperty } from '@nestjs/swagger';
import { RoleDto } from 'src/modules/roles/dtos/role-dto';
import { PermissionDto } from 'src/modules/permissions/dtos/permission-dto';
import { BaseDto } from 'src/common/dtos/base.dto';
import { UserStatus } from 'src/modules/auth/enums/user-status.enum';
import { ERoleType } from 'src/modules/roles/enums/role.enum';
import { PropertyDto } from 'src/modules/property/dto/property.dto';

export class UserDto extends BaseDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  phoneNumber: string[];

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  profilePhoto: string[];

  @ApiProperty({ type: [RoleDto] })
  roles?: RoleDto[];

  @ApiProperty({ type: [PermissionDto] })
  permissions?: PermissionDto[];

  @ApiProperty({ type: [PropertyDto]})
  properties?: PropertyDto[];

  @ApiProperty()
  role: ERoleType;

  @ApiProperty()
  status: UserStatus;
}
