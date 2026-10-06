"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Account } from "../../../types";

interface NomineeFormViewProps {
  accounts: Account[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  nomineeName: string;
  setNomineeName: (name: string) => void;
  nomineeRelation: string;
  setNomineeRelation: (relation: string) => void;
  nomineeDob: string;
  setNomineeDob: (dob: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function NomineeFormView({
  accounts,
  selectedAccountId,
  setSelectedAccountId,
  nomineeName,
  setNomineeName,
  nomineeRelation,
  setNomineeRelation,
  nomineeDob,
  setNomineeDob,
  isSubmitting,
  onSubmit,
  onCancel
}: NomineeFormViewProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
      <div className="flex flex-col gap-1.5">
        <label className="font-medium text-on-surface-variant">Select Account</label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
        >
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id} className="bg-[#191f2f] text-[#dde2f8]">
              {acc.name} ({acc.maskedNumber})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-medium text-on-surface-variant">Nominee Full Name</label>
        <input
          type="text"
          required
          value={nomineeName}
          onChange={(e) => setNomineeName(e.target.value)}
          className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-medium text-on-surface-variant">Relationship</label>
          <select
            value={nomineeRelation}
            onChange={(e) => setNomineeRelation(e.target.value)}
            className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="Spouse" className="bg-[#191f2f] text-[#dde2f8]">Spouse</option>
            <option value="Son" className="bg-[#191f2f] text-[#dde2f8]">Son</option>
            <option value="Daughter" className="bg-[#191f2f] text-[#dde2f8]">Daughter</option>
            <option value="Father" className="bg-[#191f2f] text-[#dde2f8]">Father</option>
            <option value="Mother" className="bg-[#191f2f] text-[#dde2f8]">Mother</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-medium text-on-surface-variant">Date of Birth</label>
          <input
            type="date"
            required
            value={nomineeDob}
            onChange={(e) => setNomineeDob(e.target.value)}
            className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-primary text-on-primary font-medium rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Save Nominee"}
        </button>
      </div>
    </form>
  );
}
