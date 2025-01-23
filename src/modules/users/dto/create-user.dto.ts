import { IsNotEmpty, IsAlphanumeric, IsOptional, IsEmail, MaxLength, IsEnum, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ERoleType } from "src/modules/roles/enums/role.enum";
export class CreateUserDto {
  
  @IsNotEmpty()
  @IsAlphanumeric()
  @ApiProperty({
    example: 'username',
  })
  username: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '+260xxxxx',
  })
  phoneNumber: string;

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

  @ApiProperty({
    enum: Object.values(ERoleType)
  })
  @IsNotEmpty()
  @IsEnum(ERoleType)
  role: ERoleType;

}