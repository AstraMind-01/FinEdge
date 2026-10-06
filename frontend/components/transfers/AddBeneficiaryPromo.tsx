import React from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../ui/button';

export default function AddBeneficiaryPromo() {
  return (
    <div className="w-full mt-4 bg-gradient-to-r from-surface-container-high to-surface border border-outline-variant/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20 shadow-inner group-hover:scale-105 transition-transform">
          <UserPlus size={24} className="text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-title-md font-semibold text-on-surface">Add New Beneficiary</h3>
          <p className="text-[13px] text-on-surface-variant max-w-[400px]">Add a new beneficiary securely to transfer funds faster next time without needing to enter their details again.</p>
        </div>
      </div>
      
      <Button className="shrink-0 bg-primary text-on-primary h-[44px] px-6 font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow relative z-10">
        Add Beneficiary
      </Button>
    </div>
  );
}
