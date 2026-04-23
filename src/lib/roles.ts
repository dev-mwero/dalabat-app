import { auth } from "@clerk/nextjs/server";
import { User } from "@/models/user";
import { dbConnect } from "@/lib/mongodb";

export type UserRole = "customer" | "vendor" | "teller" | "admin";

/**
 * Gets the current user's role and vendorId from the database.
 * In a production app, we'd eventually cache this in Clerk publicMetadata.
 */
export async function getCurrentUserRole() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { role: null, vendorId: null };

  await dbConnect();
  const user = await User.findOne({ clerkId });
  
  if (!user) return { role: null, vendorId: null };
  
  return {
    role: user.role as UserRole,
    vendorId: user.vendorId?.toString() || null,
  };
}

/**
 * Helper to check if a user has a specific role.
 */
export async function hasRole(allowedRoles: UserRole[]) {
  const { role } = await getCurrentUserRole();
  return role && allowedRoles.includes(role);
}

/**
 * Helper to protect routes at the page/layout level.
 */
export async function protectRole(allowedRoles: UserRole[]) {
  const { role } = await getCurrentUserRole();
  if (!role || !allowedRoles.includes(role)) {
    throw new Error("Unauthorized: Insufficient permissions");
  }
}
