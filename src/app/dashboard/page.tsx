import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/roles";

/**
 * Intelligent redirector that sends users to their respective dashboards
 * based on their roles.
 */
export default async function DashboardRedirectorPage() {
  const { role } = await getCurrentUserRole();

  if (!role) {
    redirect("/sign-in");
  }

  switch (role) {
    case "admin":
      redirect("/admin/dashboard");
    case "vendor":
      redirect("/vendor/dashboard");
    case "teller":
      redirect("/teller/orders");
    case "customer":
    default:
      redirect("/profile");
  }
}
