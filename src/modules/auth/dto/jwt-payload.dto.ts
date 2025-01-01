import { TokenType } from "src/modules/tokens/enums";

export interface JwtPayload {
  sub: string;
  tid: string;
  type: TokenType;
}
