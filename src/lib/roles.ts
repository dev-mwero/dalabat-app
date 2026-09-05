import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/user";

export type UserRole = "customer" | "vendor" | "teller" | "admin";

/**
 * Gets the current user's role and vendorId from the database.
 * In a production app, we'd eventually cache this in Clerk publicMetadata.
 */
export async function getCurrentUserRole() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { role: null, vendorId: null };

  await connectToDatabase();
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
 * Server-side route guard. Redirects unauthenticated users to sign-in and
 * users with the wrong role to their own dashboard.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const { role } = await getCurrentUserRole();

  if (!role) {
    redirect("/sign-in");
  }

  if (!allowedRoles.includes(role)) {
    redirect("/dashboard");
  }
}

/**
 * Returns the current user's identity (role + vendorId) or null when signed out.
 * Useful for API ownership checks.
 */
export async function getCurrentUserIdentity() {
  const { role, vendorId } = await getCurrentUserRole();
  return role ? { role, vendorId } : null;
}
