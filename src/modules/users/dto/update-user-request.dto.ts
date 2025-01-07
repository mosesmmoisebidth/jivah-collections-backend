import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdateUserRequestDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiProperty({
    description: 'username',
    required: false,
  })
  username: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiProperty({
    description: 'user phone number',
    required: false,
  })
  phoneNumber: string[];

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiProperty({
    description: 'user email',
    required: false,
  })
  email: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiProperty({
    description: 'First name of the user',
    required: false,
  })
  firstName: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @ApiProperty({
    description: 'last name of the user',
    required: false,
  })
  lastName: string;

  @ApiProperty({
    description: 'Image of the user',
    required: false,
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  @IsString()
  profileImage?: Express.Multer.File;
}