import { TokenType } from "src/modules/tokens/enums";
import { ERoleType } from "src/modules/roles/enums/role.enum";

export interface JwtPayload {
  sub: string;
  tid: string;
  type: TokenType;
  role: ERoleType;
}
