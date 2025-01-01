import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const IS_PUBLIC = 'isPublic';
export const PERMISSIONS = 'permissions';
export const TOKEN_NAME = 'access-token';
export const RESET_LINK = 'https://api.dev.navigo.rw/swagger'

export const AUTH_OPTIONS: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'Bearer',
};
