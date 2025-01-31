import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateUserRequestDto } from "./create-user-request.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "@nestjs/swagger";
import { Transform } from 'class-transformer';
export class UpdateUserDto extends PartialType(CreateUserRequestDto) {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiProperty({
    description: 'username',
    required: false,
  })
  username: string;

  @IsOptional()
  @ApiProperty({
    description: 'user phone number',
    required: false,
  })
  phoneNumber: string;

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

    @ApiPropertyOptional({
        description: 'Url of the uploaded profile image',
        required: false,
      })
      @IsOptional()
      @IsString()
      profileImage?: string;
}