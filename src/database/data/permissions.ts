import { Permission } from "./permissions-type"
export const permissions: Permission[] = [
    { slug: 'create.users', description: 'Create users' },
    { slug: 'read.users', description: 'Read users' },
    { slug: 'update.users', description: 'Update users' },
    { slug: 'delete.users', description: 'Delete users' },
    { slug: 'create.products', description: 'Read his/her own products' },
    { slug: 'read.products', description: 'Read his/her own products' },
    { slug: 'update.products', description: 'Update his/her own products' },
    { slug: 'delete.products', description: 'Delete his/her own products' },
]