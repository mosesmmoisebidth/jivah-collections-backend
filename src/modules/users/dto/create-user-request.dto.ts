import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEmail
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'username',
  })
  username: string;

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @ApiProperty({
    example: ['+260xxxxx'],
  })
  phoneNumber: string[];

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'example@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'John',
  })
  firstName: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({ example: ['d931c711-0c8a-4713-8a63-b1717012594f'] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({ example: ['d931c711-0c8a-4713-8a63-b1717012594f'] })
  @ArrayNotEmpty()
  @IsArray()
  @IsString({ each: true })
  roles: string[];
}
