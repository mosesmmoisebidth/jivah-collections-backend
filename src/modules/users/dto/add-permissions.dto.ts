import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
export class AddPermissionsToUser {

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    permissions: string[];
    
}