import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERoleType } from '../enums/role.enum';

export class CreateRoleRequestDto {
  @ApiProperty({
    example: ERoleType.USER
  })
  @IsNotEmpty()
  @MaxLength(50)
  name: ERoleType;

  @ApiProperty({ example: ['d931c711-0c8a-4713-8a63-b1717012594f'] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
