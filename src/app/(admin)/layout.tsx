import { Bell, Search } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireRole } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin"]);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      <AdminSidebar />

      {/* Main Content */}
      <main className="pl-72 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-10 py-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              System Overlook
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center bg-slate-100 rounded-full px-5 py-2.5 w-80 focus-within:ring-2 ring-slate-200 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-3" />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 font-medium focus:outline-none"
                placeholder="Search vendors, users, orders..."
                type="text"
              />
            </div>
            <button
              type="button"
              className="p-2.5 text-slate-400 hover:bg-slate-50 transition-colors rounded-xl relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="p-10">{children}</div>
      </main>
    </div>
  );
}
