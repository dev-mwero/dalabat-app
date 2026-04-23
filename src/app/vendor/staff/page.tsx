"use client";

import { useEffect, useState } from "react";
import { UserPlus, Mail, Shield, Trash2, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type StaffMember = {
  _id: string;
  name: string;
  email: string;
  role: "teller" | "vendor";
  createdAt: string;
};

export default function VendorStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  useEffect(() => {
    // Mock data for now until API is ready
    const mockStaff: StaffMember[] = [
      {
        _id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "teller",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "teller",
        createdAt: new Date().toISOString(),
      }
    ];
    setStaff(mockStaff);
    setLoading(false);
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    
    toast.info("Integration pending: In a real app, this would create a user with 'teller' role linked to your vendorId.");
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteName("");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Staff Management</h1>
          <p className="text-on-surface-variant text-lg">Manage your team of tellers and store assistants.</p>
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
              <h3 className="text-lg font-bold text-on-surface">{member.name}</h3>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Mail className="w-3.5 h-3.5" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-full tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {member.role}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/10">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Added on</p>
              <p className="text-sm font-medium text-on-surface">{new Date(member.createdAt).toLocaleDateString()}</p>
            </div>
          </motion.div>
        ))}

        {staff.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/30">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-on-surface-variant opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">No staff members found</h3>
            <p className="text-on-surface-variant mt-2 max-w-xs mx-auto">Start building your team by inviting your first teller to help manage orders.</p>
          </div>
        )}
      </section>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-3xl p-8 w-full max-w-md shadow-2xl border border-outline-variant/10"
          >
            <h2 className="text-2xl font-extrabold text-on-surface mb-2">Invite Teller</h2>
            <p className="text-on-surface-variant text-sm mb-6">Tellers can process orders and update stock but cannot change store settings.</p>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Full Name</label>
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
                <label className="text-sm font-bold text-on-surface ml-1">Email Address</label>
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
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 bg-surface-container-high text-on-surface font-bold py-4 rounded-2xl hover:bg-surface-container-highest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-5 h-5" />
                  Invite
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
