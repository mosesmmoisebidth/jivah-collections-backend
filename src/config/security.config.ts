import { ConfigType, registerAs } from '@nestjs/config';

export const securityRegToken = 'security';

export const SecurityConfig = registerAs(securityRegToken, () => ({
  jwtAccess: process.env.JWT_ACCESS_TOKEN_SECRET_KEY || '2cf3543db29350706897c37a1cd1381134cea139fe5e50f3908304df46d0',
  jwtAccessExpire: process.env.ACCESS_TOKEN_EXPIRE || '20m',
  jwtRefresh: process.env.JWT_REFRESH_TOKEN_SECRET_KEY || '972701cfde55256c219b579ea2b22cacbfd5e1d51f7b8e770f2949b59dd3',
  jwtRefreshExpire: process.env.REFRESH_TOKEN_EXPIRE || '30d',
  jwtCommonSecret: process.env.JWT_COMMON_SECRET_KEY || '2cf3543db29350706897c37a1cd1381134cea139fe5e50f3908304df46d0',
}));
export type ISecurityConfig = ConfigType<typeof SecurityConfig>;
