import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "src/common/dtos/base.dto";
export class CreatedUserDto extends BaseDto {

    @ApiProperty()
    username: string;

    @ApiProperty()
    email: string;

}