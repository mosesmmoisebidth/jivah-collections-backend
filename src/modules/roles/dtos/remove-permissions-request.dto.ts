import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class RemovePermissionsFromRoleRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  permissions: string[];
}
