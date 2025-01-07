import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from 'src/constants';

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS, permissions);
