import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto } from 'src/modules/permissions/dtos/permission-dto';
import { BaseDto } from 'src/common/dtos/base.dto';

export class RoleDto extends BaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [PermissionDto] })
  permissions: PermissionDto[];

  @ApiProperty()
  active: boolean;
}
