"use client";

import { Bell, MapPin, Plus, Save, Store, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { VendorRouteNav } from "@/app/vendor/_components/VendorRouteNav";

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
      const ok = await patchSettings(profile);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading settings...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <VendorRouteNav />
        <header>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your store profile, delivery zones, and notifications.
          </p>
        </header>

        <section className="max-w-sm space-y-1">
          <label
            htmlFor="vendor-selector"
            className="text-xs font-medium text-muted-foreground"
          >
            Vendor
          </label>
          <select
            id="vendor-selector"
            value={vendorId ?? ""}
            onChange={(event) => setVendorId(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>
          {currentVendorName && (
            <p className="text-xs text-muted-foreground">
              Editing: {currentVendorName}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "profile" && (
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
              <div>
                <h2 className="font-semibold text-foreground">Store Profile</h2>
                <p className="text-xs text-muted-foreground">
                  Update your store information visible to customers.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="store-name" className="text-sm text-foreground">
                  Store Name
                </label>
                <input
                  id="store-name"
                  value={profile.storeName}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      storeName: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm text-foreground"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={profile.description}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm text-foreground">
                    Phone
                  </label>
                  <input
                    id="phone"
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm text-foreground">
                  Address
                </label>
                <input
                  id="address"
                  value={profile.address}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="open-time"
                    className="text-sm text-foreground"
                  >
                    Opening Time
                  </label>
                  <input
                    id="open-time"
                    type="time"
                    value={profile.openTime}
                    onChange={(event) =>
                      setProfile((prev) => ({
                        ...prev,
                        openTime: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="close-time"
                    className="text-sm text-foreground"
                  >
                    Closing Time
                  </label>
                  <input
                    id="close-time"
                    type="time"
                    value={profile.closeTime}
                    onChange={(event) =>
                      setProfile((prev) => ({
                        ...prev,
                        closeTime: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void saveProfile()}
                  disabled={savingProfile}
                  className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
              <div>
                <h2 className="font-semibold text-foreground">
                  Delivery Zones
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configure areas you deliver to and their fees.
                </p>
              </div>

              <div className="space-y-3">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={zone.active}
                        onChange={() => toggleZone(zone.id)}
                        className="h-4 w-4"
                      />
                      <div>
                        <span
                          className={`text-sm font-medium ${
                            zone.active
                              ? "text-foreground"
                              : "text-muted-foreground line-through"
                          }`}
                        >
                          {zone.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          KSh {zone.fee} delivery fee
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-rose-600"
                      onClick={() => removeZone(zone.id)}
                      aria-label={`Remove ${zone.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border" />

              <div className="flex gap-2">
                <input
                  placeholder="Zone name"
                  value={newZoneName}
                  onChange={(event) => setNewZoneName(event.target.value)}
                  className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  placeholder="Fee (KSh)"
                  type="number"
                  min={0}
                  value={newZoneFee}
                  onChange={(event) => setNewZoneFee(event.target.value)}
                  className="h-10 w-32 rounded-md border border-input bg-background px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={addZone}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground"
                  aria-label="Add zone"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void saveDelivery()}
                  disabled={savingDelivery}
                  className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  {savingDelivery ? "Saving..." : "Save Delivery Zones"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-5">
              <div>
                <h2 className="font-semibold text-foreground">
                  Notification Preferences
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose what alerts you want to receive.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Order Alerts
                </h3>
                {[
                  {
                    key: "newOrder",
                    label: "New Orders",
                    description: "Get notified when a new order is placed",
                  },
                  {
                    key: "orderStatusChange",
                    label: "Status Changes",
                    description: "Alerts when order status is updated",
                  },
                  {
                    key: "lowStock",
                    label: "Low Stock Warnings",
                    description: "Notify when product stock runs low",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={
                        notifications[item.key as keyof NotificationsState]
                      }
                      onChange={(event) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                  </div>
                ))}
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Reports
                </h3>
                {[
                  {
                    key: "dailySummary",
                    label: "Daily Summary",
                    description: "Receive a daily sales recap",
                  },
                  {
                    key: "weeklySummary",
                    label: "Weekly Summary",
                    description: "Receive a weekly performance report",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={
                        notifications[item.key as keyof NotificationsState]
                      }
                      onChange={(event) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                  </div>
                ))}
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Channels
                </h3>
                {[
                  {
                    key: "smsAlerts",
                    label: "SMS Alerts",
                    description: "Receive notifications via SMS",
                  },
                  {
                    key: "emailAlerts",
                    label: "Email Alerts",
                    description: "Receive notifications via email",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={
                        notifications[item.key as keyof NotificationsState]
                      }
                      onChange={(event) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void saveNotifications()}
                  disabled={savingNotifications}
                  className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  {savingNotifications ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
