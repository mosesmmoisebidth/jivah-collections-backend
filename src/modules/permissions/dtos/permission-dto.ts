import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/common/dtos/base.dto';

export class PermissionDto extends BaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  active: boolean;
}
