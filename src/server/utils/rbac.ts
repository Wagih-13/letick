import { auth } from "@/auth";
import { ForbiddenError, UnauthorizedError } from "../types";

export async function requirePermission(request: Request, permission: string) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  const roles = ((session.user as any).roles as string[] | undefined) ?? [];
  if (roles.includes("super_admin")) return session;
  const perms = (session.user as any).permissions as string[] | undefined;
  if (!Array.isArray(perms) || !perms.includes(permission)) {
    throw new ForbiddenError("Missing required permission: " + permission);
  }
  return session;
}

export async function requireAnyPermission(request: Request, permissions: string[]) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  const roles = ((session.user as any).roles as string[] | undefined) ?? [];
  if (roles.includes("super_admin")) return session;
  const perms = (session.user as any).permissions as string[] | undefined;
  const hasAny = Array.isArray(perms) && permissions.some((p) => perms.includes(p));
  if (!hasAny) {
    throw new ForbiddenError("Missing required permission(s): one of [" + permissions.join(", ") + "]");
  }
  return session;
}
