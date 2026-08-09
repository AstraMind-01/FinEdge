"use client";

import React, { useState } from "react";
import { X, User, Heart, Percent, CheckCircle2, Loader2 } from "lucide-react";
import { Account } from "../../types";

interface UpdateNomineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account | null;
  onUpdateNominee?: (accountId: string, nomineeName: string, relation: string) => void;
  currentNominee?: {
    name: string;
    relationship: string;
    share: string;
  };
  onSaveNominee?: (updated: { name: string; relationship: string; share: string }) => void;
}

export default function UpdateNomineeModal({
  isOpen,
  onClose,
  account,
  onUpdateNominee,
  currentNominee,
  onSaveNominee
}: UpdateNomineeModalProps) {
  const initialName = currentNominee?.name || account?.nominee || "Anjali Ranjan";
  const initialRel = currentNominee?.relationship || account?.nomineeRelation || "Spouse";
  const initialShare = currentNominee?.share || "100% Share";

  const [name, setName] = useState(initialName);
  const [relationship, setRelationship] = useState(initialRel);
  const [share, setShare] = useState(initialShare);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      if (onUpdateNominee && account) {
        onUpdateNominee(account.id, name, relationship);
      }
      if (onSaveNominee) {
        onSaveNominee({ name, relationship, share });
      }
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Update Nominee Details</h2>
            <p className="text-xs text-on-surface-variant">
              {account ? `Register nominee for ${account.name} (${account.maskedNumber})` : 'Register nominee for bank accounts & deposits'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-primary" /> Nominee Full Name
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
              <Heart size={14} className="text-primary" /> Relationship
            </label>
            <select 
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
            >
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent (Father / Mother)</option>
              <option value="Child">Child (Son / Daughter)</option>
              <option value="Sibling">Sibling</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
              <Percent size={14} className="text-primary" /> Share Allocation (%)
            </label>
            <input 
              type="text"
              value={share}
              onChange={e => setShare(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  Update Nominee <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
