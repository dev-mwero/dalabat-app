import { BarChart3 } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Market Growth</h1>
      <p className="mt-1 text-slate-500">
        Sales trends, signups, top vendors, and category performance.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-700">
          Analytics dashboards are coming soon
        </p>
        <p className="text-sm text-slate-400">
          Cross-vendor revenue and growth charts land in a later release.
        </p>
      </div>
    </div>
  );
}
