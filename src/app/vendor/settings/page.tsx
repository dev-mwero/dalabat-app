"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Edit,
  Lightbulb,
  MapPin,
  Plus,
  Save,
  Store,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Vendor = {
  _id: string;
  name: string;
};

type ProfileState = {
  storeName: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  openTime: string;
  closeTime: string;
};

type Zone = {
  id: string;
  name: string;
  fee: number;
  active: boolean;
};

type NotificationsState = {
  newOrder: boolean;
  orderStatusChange: boolean;
  lowStock: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
  smsAlerts: boolean;
  emailAlerts: boolean;
};

type SettingsResponse = {
  data: {
    profile: ProfileState;
    zones: Array<{ _id?: string; name: string; fee: number; active: boolean }>;
    notifications: NotificationsState;
  };
};

type TabKey = "profile" | "delivery" | "notifications";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Store }> = [
  { key: "profile", label: "Profile", icon: Store },
  { key: "delivery", label: "Delivery", icon: MapPin },
  { key: "notifications", label: "Notifications", icon: Bell },
];

const defaultProfile: ProfileState = {
  storeName: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  openTime: "07:00",
  closeTime: "21:00",
};

const defaultNotifications: NotificationsState = {
  newOrder: true,
  orderStatusChange: true,
  lowStock: true,
  dailySummary: false,
  weeklySummary: true,
  smsAlerts: true,
  emailAlerts: false,
};

export default function VendorSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [zones, setZones] = useState<Zone[]>([]);
  const [notifications, setNotifications] =
    useState<NotificationsState>(defaultNotifications);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVendors() {
      try {
        const response = await fetch("/api/vendors?limit=50&sort=rating_desc", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load vendors");
        }

        const result = await response.json();
        const list = (result.data ?? []) as Vendor[];
        setVendors(list);
        setVendorId(list[0]?._id ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError("Unable to load vendors");
        setLoading(false);
      }
    }

    loadVendors();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadSettings() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/vendor/settings?vendorId=${vendorId}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const result = (await response.json()) as SettingsResponse;

        setProfile(result.data.profile ?? defaultProfile);
        setZones(
          (result.data.zones ?? []).map((zone, index) => ({
            id: zone._id ?? `${index}-${zone.name}`,
            name: zone.name,
            fee: Number(zone.fee),
            active: Boolean(zone.active),
          })),
        );
        setNotifications(result.data.notifications ?? defaultNotifications);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError("Unable to load settings");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();

    return () => {
      controller.abort();
    };
  }, [vendorId]);

  const currentVendorName = useMemo(
    () => vendors.find((vendor) => vendor._id === vendorId)?.name,
    [vendorId, vendors],
  );

  async function patchSettings(payload: Record<string, unknown>) {
    if (!vendorId) {
      toast.error("No vendor selected");
      return false;
    }

    const response = await fetch(`/api/vendor/settings?vendorId=${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ error: "Failed to save" }));
      toast.error(data.error ?? "Failed to save settings");
      return false;
    }

    return true;
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const ok = await patchSettings({ profile });
      if (ok) {
        toast.success("Store profile saved");
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveDelivery() {
    setSavingDelivery(true);
    try {
      const ok = await patchSettings({
        zones: zones.map((zone) => ({
          name: zone.name,
          fee: Number(zone.fee),
          active: zone.active,
        })),
      });

      if (ok) {
        toast.success("Delivery zones saved");
      }
    } finally {
      setSavingDelivery(false);
    }
  }

  async function saveNotifications() {
    setSavingNotifications(true);
    try {
      const ok = await patchSettings({ notifications });
      if (ok) {
        toast.success("Notification preferences saved");
      }
    } finally {
      setSavingNotifications(false);
    }
  }

  function addZone() {
    const trimmedName = newZoneName.trim();
    const fee = Number(newZoneFee);

    if (!trimmedName || Number.isNaN(fee) || fee < 0) {
      toast.error("Enter a valid zone name and fee");
      return;
    }

    setZones((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        name: trimmedName,
        fee,
        active: true,
      },
    ]);

    setNewZoneName("");
    setNewZoneFee("");
  }

  function removeZone(id: string) {
    setZones((prev) => prev.filter((zone) => zone.id !== id));
  }

  function toggleZone(id: string) {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === id ? { ...zone, active: !zone.active } : zone,
      ),
    );
  }

  if (loading && !profile.storeName) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse text-on-surface-variant">
        Loading settings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 text-error bg-error-container rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Store Management
          </h1>
          <p className="text-on-surface-variant text-lg">
            Configure your digital storefront and preference profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={vendorId ?? ""}
            onChange={(event) => setVendorId(event.target.value)}
            className="h-12 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
          >
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Tabbed Interface */}
      <div className="flex gap-8 border-b border-surface-container mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "text-primary border-b-2 border-primary-container"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Form Content */}
        <div className="xl:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                {/* Profile Section Card */}
                <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                  <h3 className="text-xl font-bold mb-6 text-on-surface">
                    Store Identity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-on-surface-variant px-1">
                        Store Name
                      </label>
                      <input
                        value={profile.storeName}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            storeName: e.target.value,
                          }))
                        }
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container text-on-surface font-medium"
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-on-surface-variant px-1">
                        Primary Category
                      </label>
                      <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container text-on-surface font-medium">
                        <option>Bakery & Pastries</option>
                        <option>Organic Produce</option>
                        <option>Artisan Cheese</option>
                        <option>General Groceries</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-on-surface-variant px-1">
                        Description
                      </label>
                      <textarea
                        value={profile.description}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container text-on-surface font-medium resize-none"
                        rows={4}
                      />
                    </div>
                  </div>
                </section>

                {/* Contact & Location */}
                <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                  <h3 className="text-xl font-bold mb-6 text-on-surface">
                    Contact & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-on-surface-variant px-1">
                        Email Address
                      </label>
                      <input
                        value={profile.email}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container text-on-surface font-medium"
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-on-surface-variant px-1">
                        Phone Number
                      </label>
                      <input
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container text-on-surface font-medium"
                        type="tel"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-on-surface-variant px-1">
                        Business Address
                      </label>
                      <input
                        value={profile.address}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, address: e.target.value }))
                        }
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container text-on-surface font-medium"
                        type="text"
                      />
                    </div>
                  </div>
                </section>

                {/* Operating Hours */}
                <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                  <h3 className="text-xl font-bold mb-6 text-on-surface">
                    Operating Hours
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-container-low p-4 rounded-xl text-center">
                      <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Open
                      </span>
                      <input
                        type="time"
                        value={profile.openTime}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            openTime: e.target.value,
                          }))
                        }
                        className="bg-transparent border-none text-sm font-semibold text-on-surface text-center p-0 focus:ring-0"
                      />
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl text-center">
                      <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Close
                      </span>
                      <input
                        type="time"
                        value={profile.closeTime}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            closeTime: e.target.value,
                          }))
                        }
                        className="bg-transparent border-none text-sm font-semibold text-on-surface text-center p-0 focus:ring-0"
                      />
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl text-center border-2 border-primary-container/20 opacity-50">
                      <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                        Sunday
                      </span>
                      <span className="text-sm font-semibold text-on-surface">
                        Closed
                      </span>
                    </div>
                    <div className="flex items-center justify-center border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors text-primary-container flex-col gap-1">
                      <Edit className="w-5 h-5" />
                      <span className="text-xs font-bold">Edit Schedule</span>
                    </div>
                  </div>
                </section>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => saveProfile()}
                    disabled={savingProfile}
                    className="bg-primary-container text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary-container/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {savingProfile ? "Saving..." : "Save Profile Changes"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "delivery" && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                  <h3 className="text-xl font-bold mb-6 text-on-surface">
                    Delivery Zones
                  </h3>
                  <div className="space-y-4">
                    {zones.map((zone) => (
                      <div
                        key={zone.id}
                        className={`flex items-center justify-between p-4 rounded-xl border ${zone.active ? "bg-surface-container-low border-transparent" : "bg-transparent border-outline-variant/30 opacity-60"}`}
                      >
                        <div className="flex items-center gap-4">
                          <label className="relative flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={zone.active}
                              onChange={() => toggleZone(zone.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary-container transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                          </label>
                          <div>
                            <span
                              className={`text-sm font-bold ${zone.active ? "text-on-surface" : "text-on-surface-variant line-through"}`}
                            >
                              {zone.name}
                            </span>
                            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                              KSh {zone.fee} delivery fee
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeZone(zone.id)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-surface-container flex flex-col sm:flex-row gap-3">
                    <input
                      placeholder="Zone name (e.g. Westlands)"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container"
                    />
                    <input
                      placeholder="Fee (KSh)"
                      type="number"
                      value={newZoneFee}
                      onChange={(e) => setNewZoneFee(e.target.value)}
                      className="w-32 bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container"
                    />
                    <button
                      onClick={addZone}
                      className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </section>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => saveDelivery()}
                    disabled={savingDelivery}
                    className="bg-primary-container text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary-container/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {savingDelivery ? "Saving..." : "Save Delivery Zones"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                  <h3 className="text-xl font-bold mb-6 text-on-surface">
                    Order Alerts
                  </h3>
                  <div className="space-y-6">
                    {[
                      {
                        key: "newOrder",
                        label: "New Orders",
                        desc: "Get notified when a new order is placed",
                      },
                      {
                        key: "orderStatusChange",
                        label: "Status Changes",
                        desc: "Alerts when order status is updated",
                      },
                      {
                        key: "lowStock",
                        label: "Low Stock Warnings",
                        desc: "Notify when product stock runs low",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            {item.label}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {item.desc}
                          </p>
                        </div>
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              notifications[
                                item.key as keyof NotificationsState
                              ]
                            }
                            onChange={(e) =>
                              setNotifications((p) => ({
                                ...p,
                                [item.key]: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary-container transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                  <h3 className="text-xl font-bold mb-6 text-on-surface">
                    Reports & Channels
                  </h3>
                  <div className="space-y-6">
                    {[
                      {
                        key: "dailySummary",
                        label: "Daily Summary",
                        desc: "Receive a daily sales recap",
                      },
                      {
                        key: "weeklySummary",
                        label: "Weekly Summary",
                        desc: "Receive a weekly performance report",
                      },
                      {
                        key: "smsAlerts",
                        label: "SMS Alerts",
                        desc: "Receive critical notifications via SMS",
                      },
                      {
                        key: "emailAlerts",
                        label: "Email Alerts",
                        desc: "Receive detailed notifications via email",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            {item.label}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {item.desc}
                          </p>
                        </div>
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              notifications[
                                item.key as keyof NotificationsState
                              ]
                            }
                            onChange={(e) =>
                              setNotifications((p) => ({
                                ...p,
                                [item.key]: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary-container transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => saveNotifications()}
                    disabled={savingNotifications}
                    className="bg-primary-container text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary-container/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {savingNotifications ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Visual Preview */}
        <div className="xl:col-span-4 space-y-6 hidden lg:block">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
            <div className="h-48 relative bg-surface-container-low">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop"
                alt="Storefront cover"
                fill
                sizes="400px"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-4 left-6 pr-6">
                <span className="bg-primary-container text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Active Storefront
                </span>
                <h2 className="text-white text-xl font-bold mt-2 truncate">
                  {profile.storeName || currentVendorName || "Your Store Name"}
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Premium Vendor</h4>
                  <p className="text-xs text-on-surface-variant">
                    Active since 2024
                  </p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                This preview shows how your store appears to customers in the
                marketplace discovery feed. Make sure your profile details are
                accurate and up-to-date.
              </p>
            </div>
          </div>

          {/* Helper Card */}
          <div className="bg-secondary-container/40 rounded-xl p-6 border border-secondary-container">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-secondary-container rounded-lg shrink-0">
                <Lightbulb className="w-6 h-6 text-on-secondary-container" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface mb-1">Pro Tip</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Keeping your operating hours updated reduces missed orders and
                  increases customer satisfaction by up to 40%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
