import type { Role } from '@prisma/client';
import { auth } from '@/lib/auth';
import { can, type Permission } from '@/lib/permissions';

export type AdminSessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: Role;
};

export async function getPermissionedUser(permission: Permission): Promise<AdminSessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !can(user.role, permission)) return null;
  return user as AdminSessionUser;
}

export async function getAdminUser(): Promise<AdminSessionUser | null> {
  return getPermissionedUser('admin.full');
}
