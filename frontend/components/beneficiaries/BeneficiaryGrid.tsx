"use client";
import React, { useEffect, useState } from 'react';
import { MoreVertical, Send, Building2, User } from 'lucide-react';
import { MockApi } from '../../lib/mockApi';
import { Beneficiary } from '../../types';

export default function BeneficiaryGrid() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenes = async () => {
      try {
        const data = await MockApi.getBeneficiaries();
        setBeneficiaries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenes();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container rounded-xl border border-surface-container-highest p-6 h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  const maskAccount = (acc: string) => `•••• ${acc.slice(-4)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
      {beneficiaries.map((ben) => (
        <div key={ben.id} className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6 relative group hover:border-primary/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
          
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
                <h3 className="font-semibold text-lg text-on-surface m-0 group-hover:text-primary transition-colors">{ben.name}</h3>
                <span className="text-xs text-on-surface-variant mt-0.5 uppercase tracking-wider">{ben.id}</span>
              </div>
            </div>
            
            <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container-highest transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

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

          <div className="flex gap-3 relative z-10">
            <button className="flex-1 bg-primary text-on-primary font-semibold text-sm py-2.5 rounded-lg hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-all flex justify-center items-center gap-2">
              <Send size={16} />
              Send Money
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
