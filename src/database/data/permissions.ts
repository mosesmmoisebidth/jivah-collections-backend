import { Permission } from "./permissions-type"
export const permissions: Permission[] = [
    { slug: 'create.users', description: 'Create users' },
    { slug: 'read.users', description: 'Read users' },
    { slug: 'update.users', description: 'Update users' },
    { slug: 'delete.users', description: 'Delete users' },
    { slug: 'create.products', description: 'Create his/her own products' },
    { slug: 'read.products', description: 'Read his/her own products' },
    { slug: 'update.products', description: 'Update his/her own products' },
    { slug: 'delete.products', description: 'Delete his/her own products' },
    { slug: 'read.permissions', description: 'Read his/her own permissions' },
    { slug: 'update.permissions', description: 'Update his/her own permissions' },
    { slug: 'delete.permissions', description: 'Delete his/her own permissions' },
    { slug: 'add.permissions', description: 'Add permissions to a role'},
    { slug: 'remove.permissions', description: 'Remove permissions from a role'},
    { slug: 'create.roles', description: 'Create roles' },
    { slug: 'read.roles', description: 'Read roles' },
    { slug: 'update.roles', description: 'Update roles' },
    { slug: 'delete.roles', description: 'Delete roles' }
    
]