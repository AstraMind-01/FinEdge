"use client";

import React, { useState } from 'react';
import { MoreVertical, Send, Building2, User, Edit2, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { Beneficiary } from '../../types';

interface BeneficiaryGridProps {
  beneficiaries: Beneficiary[];
  loading: boolean;
  onSendMoney: (beneficiary: Beneficiary) => void;
  onEditBeneficiary: (beneficiary: Beneficiary) => void;
  onDeleteBeneficiary: (beneficiary: Beneficiary) => void;
}

export default function BeneficiaryGrid({
  beneficiaries,
  loading,
  onSendMoney,
  onEditBeneficiary,
  onDeleteBeneficiary
}: BeneficiaryGridProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container rounded-xl border border-surface-container-highest p-6 h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <div className="bg-surface-container rounded-xl border border-surface-container-highest p-12 text-center flex flex-col items-center gap-3 mt-6">
        <User size={40} className="text-on-surface-variant opacity-40" />
        <h3 className="text-lg font-bold text-on-surface m-0">No Beneficiaries Found</h3>
        <p className="text-xs text-on-surface-variant max-w-sm">No beneficiaries match your search criteria. Click "+ Add New Beneficiary" to register a new recipient.</p>
      </div>
    );
  }

  const maskAccount = (acc: string) => `•••• ${acc.slice(-4)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
      {beneficiaries.map((ben) => {
        const isCooling = ben.status === "COOLING_PERIOD";
        return (
          <div key={ben.id} className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6 relative group hover:border-primary/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
            
            {/* Top Card Bar */}
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant overflow-hidden shrink-0">
                  {ben.avatarUrl ? (
                    <img src={ben.avatarUrl} alt={ben.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-on-surface-variant" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-on-surface m-0 group-hover:text-primary transition-colors">{ben.name}</h3>
                    {isCooling && (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold flex items-center gap-1">
                        <Clock size={10} /> COOLING
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant mt-0.5 uppercase tracking-wider">{ben.code || ben.id}</span>
                </div>
              </div>
              
              {/* Options Menu */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setOpenMenuId(openMenuId === ben.id ? null : ben.id)}
                  className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  <MoreVertical size={20} />
                </button>

                {openMenuId === ben.id && (
                  <div className="absolute right-0 top-9 w-44 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl z-50 p-1 flex flex-col gap-1 text-xs animate-in fade-in duration-150">
                    <button 
                      type="button"
                      onClick={() => { setOpenMenuId(null); onSendMoney(ben); }}
                      className="p-2 rounded-lg hover:bg-surface-variant text-left font-medium text-on-surface flex items-center gap-2 cursor-pointer"
                    >
                      <Send size={14} className="text-primary" /> Send Money
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setOpenMenuId(null); onEditBeneficiary(ben); }}
                      className="p-2 rounded-lg hover:bg-surface-variant text-left font-medium text-on-surface flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 size={14} className="text-teal-400" /> Edit Limit
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setOpenMenuId(null); onDeleteBeneficiary(ben); }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-left font-medium text-red-400 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={14} /> Remove Beneficiary
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Details Box */}
            <div className="flex flex-col gap-3 mb-6 relative z-10 bg-[#1E293B] p-4 rounded-lg border border-surface-container-highest group-hover:border-primary/20 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Building2 size={16} />
                  <span className="text-xs font-medium">Bank Name</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">{ben.bankName}</span>
              </div>
              <div className="h-px bg-surface-container-highest w-full"></div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="font-mono text-xs font-medium pl-6">Acc. No</span>
                </div>
                <span className="font-mono text-sm font-semibold text-on-surface tracking-wider">{maskAccount(ben.accountNumber)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 relative z-10">
              <button 
                type="button"
                onClick={() => onSendMoney(ben)}
                className="flex-1 bg-primary text-on-primary font-semibold text-sm py-2.5 rounded-lg hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-all flex justify-center items-center gap-2 cursor-pointer"
              >
                <Send size={16} />
                Send Money
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
