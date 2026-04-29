"use client";

import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Mail,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type StaffMember = {
  _id: string;
  name: string;
  email: string;
  role: "teller" | "admin";
  status: "pending" | "accepted";
  createdAt: string;
};

export default function VendorStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await fetch("/api/vendor/staff/invite");
      if (res.ok) {
        const result = await res.json();
        setStaff(result.data || []);
      }
    } catch (e) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    setIsInviting(true);
    try {
      const res = await fetch("/api/vendor/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send invite");
        return;
      }

      toast.success("Invite generated successfully!");
      setGeneratedLink(data.inviteLink);
      setInviteEmail("");
      setInviteName("");
      fetchInvites();
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    }
  };

  const closeModals = () => {
    setIsInviteModalOpen(false);
    setGeneratedLink(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Staff Management
          </h1>
          <p className="text-on-surface-variant text-lg">
            Manage your team of tellers and store assistants.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-primary text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          Add Teller
        </button>
      </section>

      {/* Staff Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {member.name.charAt(0)}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">
                {member.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Mail className="w-3.5 h-3.5" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-full tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {member.role}
                </span>
                <span
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider flex items-center gap-1 ${
                    member.status === "accepted"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {member.status}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/10">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">
                Invited on
              </p>
              <p className="text-sm font-medium text-on-surface">
                {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}

        {staff.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/30">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-on-surface-variant opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">
              No staff members found
            </h3>
            <p className="text-on-surface-variant mt-2 max-w-xs mx-auto">
              Start building your team by inviting your first teller to help
              manage orders.
            </p>
          </div>
        )}
      </section>

      {/* Invite Modal */}
      {(isInviteModalOpen || generatedLink) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-3xl p-8 w-full max-w-md shadow-2xl border border-outline-variant/10"
          >
            {generatedLink ? (
              <>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-on-surface text-center mb-2">
                  Invite Generated
                </h2>
                <p className="text-on-surface-variant text-sm text-center mb-6">
                  Copy this link and send it to your teller to grant them access
                  to your store.
                </p>
                <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3 mb-8 border border-outline-variant/20">
                  <span className="text-sm text-on-surface truncate flex-1">
                    {generatedLink}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </button>
                </div>
                <button
                  onClick={closeModals}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-on-surface mb-2">
                  Invite Teller
                </h2>
                <p className="text-on-surface-variant text-sm mb-6">
                  Tellers can process orders and update stock but cannot change
                  store settings.
                </p>

                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Michael Teller"
                      className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teller@example.com"
                      className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="flex-1 bg-surface-container-high text-on-surface font-bold py-4 rounded-2xl hover:bg-surface-container-highest transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isInviting}
                      className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isInviting ? (
                        "Creating..."
                      ) : (
                        <>
                          <UserCheck className="w-5 h-5" /> Invite
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
