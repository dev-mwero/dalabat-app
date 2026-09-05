"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Total Revenue",
      value: "KES 1,240,500",
      change: "+12.5%",
      trendingUp: true,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active Vendors",
      value: "48",
      change: "+4",
      trendingUp: true,
      icon: Store,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Customers",
      value: "1,204",
      change: "+182",
      trendingUp: true,
      icon: Users,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Market Growth",
      value: "24.8%",
      change: "-2.1%",
      trendingUp: false,
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const recentActions = [
    {
      id: 1,
      action: "New Vendor Approval",
      target: "Organic Roots Store",
      time: "2 hours ago",
      status: "pending",
      icon: Clock,
    },
    {
      id: 2,
      action: "Payout Processed",
      target: "Kilimani Fresh",
      time: "5 hours ago",
      status: "completed",
      icon: CheckCircle2,
    },
    {
      id: 3,
      action: "User Dispute Raised",
      target: "Order #88219",
      time: "Yesterday",
      status: "urgent",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
          Platform Overview
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Real-time performance and system health metrics.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-bold ${stat.trendingUp ? "text-emerald-500" : "text-rose-500"}`}
              >
                {stat.change}
                {stat.trendingUp ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
              </div>
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <section className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold">System Log</h3>
            <button
              type="button"
              className="text-sm font-bold text-slate-400 hover:text-slate-900"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActions.map((item) => (
              <div
                key={item.id}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      item.status === "urgent"
                        ? "bg-rose-50 text-rose-600"
                        : item.status === "pending"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.action}</p>
                    <p className="text-sm text-slate-500 font-medium">
                      {item.target}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {item.time}
                  </p>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      item.status === "urgent"
                        ? "text-rose-500"
                        : item.status === "pending"
                          ? "text-amber-500"
                          : "text-emerald-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support Quick Glance */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-slate-200">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4">Market Health</h3>
            <p className="text-slate-400 font-medium mb-8">
              Platform is running at optimal capacity. 0 downtime incidents in
              the last 30 days.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>API Uptime</span>
                  <span>99.9%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "99.9%" }}
                    className="h-full bg-emerald-400"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Database Load</span>
                  <span>12%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "12%" }}
                    className="h-full bg-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-800 rounded-full blur-3xl opacity-50"></div>
        </section>
      </div>
    </div>
  );
}
