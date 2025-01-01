// src/modules/roles/data/roles.ts
import { permissions } from "./permissions";
import { ERoleType } from "src/modules/roles/enums/role.enum"; // Ensure correct import path
import { Permission } from "./permissions-type";
export const rolePermissions: Record<ERoleType, Permission[]> = {
    [ERoleType.ROLE_ADMIN]: permissions, 
    [ERoleType.ROLE_SELLER]: permissions.slice(4, 8),
    [ERoleType.ROLE_BUYER]: []
};
