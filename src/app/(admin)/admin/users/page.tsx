import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Clients</h1>
      <p className="mt-1 text-slate-500">
        Manage customer, vendor, and teller accounts across the platform.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <Users className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-700">
          User management is coming soon
        </p>
        <p className="text-sm text-slate-400">
          Add, disable, and re-role users from this panel in a later release.
        </p>
      </div>
    </div>
  );
}
