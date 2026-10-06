"use client";

import React, { useState } from "react";
import { X, User, Mail, Smartphone, MapPin, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import HighSecurityEditModal from "./HighSecurityEditModal";

interface FieldChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    branch: string;
  };
  onSaveProfile: (updated: {
    name: string;
    email: string;
    phone: string;
    address: string;
    branch: string;
  }, changes: FieldChange[]) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile
}: EditProfileModalProps) {
  const [name, setName] = useState(currentProfile.name);
  const [email, setEmail] = useState(currentProfile.email);
  const [phone, setPhone] = useState(currentProfile.phone);
  const [address, setAddress] = useState(currentProfile.address);
  const [branch, setBranch] = useState(currentProfile.branch);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [computedChanges, setComputedChanges] = useState<FieldChange[]>([]);

  if (!isOpen) return null;

  const getModifiedFields = (): FieldChange[] => {
    const changes: FieldChange[] = [];
    if (name !== currentProfile.name) {
      changes.push({ fieldName: "Full Name", oldValue: currentProfile.name, newValue: name });
    }
    if (email !== currentProfile.email) {
      changes.push({ fieldName: "Email Address", oldValue: currentProfile.email, newValue: email });
    }
    if (phone !== currentProfile.phone) {
      changes.push({ fieldName: "Phone Number", oldValue: currentProfile.phone, newValue: phone });
    }
    if (address !== currentProfile.address) {
      changes.push({ fieldName: "Primary Address", oldValue: currentProfile.address, newValue: address });
    }
    if (branch !== currentProfile.branch) {
      changes.push({ fieldName: "Preferred Bank Branch", oldValue: currentProfile.branch, newValue: branch });
    }
    return changes;
  };

  const changes = getModifiedFields();
  const hasChanges = changes.length > 0;

  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    setComputedChanges(changes);
    setSecurityModalOpen(true);
  };

  const handleConfirmHighSecuritySave = () => {
    onSaveProfile({ name, email, phone, address, branch }, computedChanges);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
        <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                Edit Profile Details
                <span className="px-2 py-0.5 rounded text-[10px] bg-teal-400/10 text-teal-400 border border-teal-400/20 font-bold uppercase">2FA Protected</span>
              </h2>
              <p className="text-xs text-on-surface-variant">Update contact &amp; primary address details</p>
            </div>
            <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleInitiateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-primary" /> Full Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
                <Mail size={14} className="text-primary" /> Email Address
              </label>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
                <Smartphone size={14} className="text-primary" /> Phone Number
              </label>
              <input 
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" /> Primary Residential Address
              </label>
              <textarea 
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
                <Building2 size={14} className="text-primary" /> Preferred Bank Branch
              </label>
              <select 
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
              >
                <option value="Mumbai Corporate">Mumbai Corporate Branch (BKC)</option>
                <option value="Connaught Place, New Delhi">Connaught Place, New Delhi</option>
                <option value="Indiranagar, Bengaluru">Indiranagar, Bengaluru</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-[11px] text-on-surface-variant">
                {hasChanges ? `${changes.length} change(s) • Requires 2FA` : 'No changes made'}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
                <button 
                  type="submit" 
                  disabled={!hasChanges}
                  className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    hasChanges 
                      ? 'bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] cursor-pointer' 
                      : 'bg-surface-variant text-on-surface-variant opacity-40 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck size={16} /> Save &amp; Verify 2FA
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>

      {/* High Security Verification Modal */}
      <HighSecurityEditModal 
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        changes={computedChanges}
        onConfirmSave={handleConfirmHighSecuritySave}
      />
    </>
  );
}
