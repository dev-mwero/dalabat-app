import { ArrowLeft, Bell, Search } from "lucide-react";
import Link from "next/link";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { requireRole } from "@/lib/roles";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["vendor"]);

  return (
    <div className="bg-surface text-on-surface font-sans">
      <VendorSidebar />

      {/* Main Content Area */}
      <main className="pl-64 min-h-screen">
        {/* TopNavBar */}
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-8 py-4 shadow-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold italic text-primary">
              The Digital Pantry
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 focus-within:ring-2 ring-primary-container transition-all">
              <Search className="w-4 h-4 text-on-surface-variant mr-2" />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/50 focus:outline-none"
                placeholder="Search data..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Market
              </Link>
              <button
                className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full relative"
                type="button"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
