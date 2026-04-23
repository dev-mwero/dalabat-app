"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Settings, 
  Search, 
  Bell,
  BarChart3,
  ShieldCheck,
  Globe
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Global Stats", icon: LayoutDashboard },
    { href: "/admin/vendors", label: "Vendors", icon: Store },
    { href: "/admin/users", label: "Clients", icon: Users },
    { href: "/admin/analytics", label: "Market Growth", icon: BarChart3 },
    { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Admin Sidebar */}
      <aside className="h-screen w-72 fixed left-0 top-0 border-r border-slate-200 bg-white flex flex-col gap-2 p-6 z-50">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Dalabat</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
              <UserButton afterSignOutUrl="/" />
              <div className="text-right">
                 <p className="font-bold text-xs">Admin Panel</p>
                 <Link href="/" className="text-[10px] text-slate-400 hover:text-slate-900 flex items-center gap-1 justify-end">
                    <Globe className="w-3 h-3" /> Live Site
                 </Link>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-72 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-10 py-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">System Overlook</h2>
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
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 transition-colors rounded-xl relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
