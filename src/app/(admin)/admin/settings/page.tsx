import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">
        Platform Settings
      </h1>
      <p className="mt-1 text-slate-500">
        Global payment, delivery, and marketplace configuration.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <Settings className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-700">
          Platform configuration is coming soon
        </p>
        <p className="text-sm text-slate-400">
          Delivery fees, commission rates, and payment providers ship later.
        </p>
      </div>
    </div>
  );
}
