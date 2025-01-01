import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsNotEmpty } from 'class-validator';

export class AddPermissionsToRoleRequestDto {
  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  permissions: string[];
}
