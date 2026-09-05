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
      break;
    case "vendor":
      redirect("/vendor/dashboard");
      break;
    case "teller":
      redirect("/teller/orders");
      break;
    default:
      redirect("/profile");
  }
}
