import { Permission } from "./permissions-type"
export const permissions: Permission[] = [
    { slug: 'create.users', description: 'Create buyers or sellers' },
    { slug: 'read.users', description: 'Read buyres or sellers' },
    { slug: 'update.users', description: 'Update buyers or sellers' },
    { slug: 'delete.users', description: 'Delete buyers or sellers' },
    { slug: 'create.properties', description: 'Read his/her own properties' },
    { slug: 'read.properties', description: 'Read his/her own properties' },
    { slug: 'update.properties', description: 'Update his/her own properties' },
    { slug: 'delete.properties', description: 'Delete his/her own properties' },
]