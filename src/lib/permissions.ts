import { auth } from "@/lib/auth";

export async function getSession() {
  return await auth();
}

export async function hasPermission(permissionName: string): Promise<boolean> {
  const session = await auth();
  if (!session) return false;
  const permissions = (session.user as any).permissions as string[] | undefined;
  return permissions?.includes(permissionName) ?? false;
}

export async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}
