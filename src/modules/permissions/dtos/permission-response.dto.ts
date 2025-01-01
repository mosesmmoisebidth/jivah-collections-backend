import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto } from './permission-dto';

export class PermissionResponseDto {
  @ApiProperty({ type: PermissionDto })
  permission: PermissionDto;
}

export class PermissionsResponseDto {
  @ApiProperty({ type: [PermissionDto] })
  permissions: PermissionDto[];
}
