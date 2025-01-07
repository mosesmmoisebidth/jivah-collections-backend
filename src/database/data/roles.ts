import { permissions } from "./permissions";
import { ERoleType } from "src/modules/roles/enums/role.enum"; // Ensure correct import path
import { Permission } from "./permissions-type";
export const rolePermissions: Record<ERoleType, Permission[]> = {
    [ERoleType.ADMIN]: permissions,
    [ERoleType.USER]: []
};
