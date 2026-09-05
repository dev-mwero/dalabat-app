import { Store } from "lucide-react";
import { TellerSidebar } from "@/components/teller/TellerSidebar";
import { requireRole } from "@/lib/roles";

export default async function TellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["teller", "vendor"]);

  return (
    <div className="bg-surface text-on-surface font-sans">
      <TellerSidebar />

      {/* Main Content Area */}
      <main className="pl-64 min-h-screen">
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-8 py-4 shadow-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <Store className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold tracking-tight text-on-surface">
              Store Terminal
            </span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
