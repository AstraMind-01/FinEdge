import React, { useState } from 'react';
import { X, CalendarClock } from 'lucide-react';
import { Button } from '../../ui/button';
import { Account, Beneficiary } from '../../../types';

interface ScheduleTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  beneficiaries: Beneficiary[];
  initialPurpose?: string;
}

export default function ScheduleTransferModal({
  isOpen, onClose, accounts, beneficiaries, initialPurpose
}: ScheduleTransferModalProps) {
  
  const [purpose, setPurpose] = useState(initialPurpose || "");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-surface-container rounded-3xl border border-outline-variant/20 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarClock size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[18px] font-bold text-on-surface leading-tight">Schedule Transfer</h2>
              <span className="text-[12px] text-on-surface-variant">Set up a recurring or future payment</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-surface-high text-on-surface-variant transition-colors border border-outline-variant/10">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-on-surface-variant">Purpose / Nickname</label>
            <input 
              type="text" 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" 
              placeholder="e.g. Rent, EMI, Electricity" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">Transfer To</label>
              <select className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50">
                <option value="">Select Beneficiary...</option>
                {beneficiaries.map(b => (
                  <option key={b.id} value={b.id}>{b.name} - {b.bankName}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">From Account</label>
              <select className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50">
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.maskedNumber})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-on-surface-variant">Amount (₹)</label>
            <input 
              type="number" 
              className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 font-bold text-[16px] text-on-surface focus:outline-none focus:border-primary/50" 
              placeholder="0.00" 
            />
          </div>

          <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20 my-1"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">Frequency</label>
              <select className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50">
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
                <option value="YEARLY">Yearly</option>
                <option value="ONCE">One-Time (Future Date)</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">Transfer Mode</label>
              <select className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50">
                <option value="IMPS">IMPS (Instant)</option>
                <option value="NEFT">NEFT (2-4 hours)</option>
                <option value="RTGS">RTGS (Same day)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">Start Date</label>
              <input type="date" className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant flex justify-between">
                <span>End Date</span>
                <span className="text-primary cursor-pointer hover:underline text-[10px] mt-0.5">Until cancelled</span>
              </label>
              <input type="date" className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 opacity-50 cursor-not-allowed" disabled />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low flex items-center justify-between">
          <button onClick={onClose} className="text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
            Cancel
          </button>
          <Button 
            onClick={() => {
              alert("Scheduled transfer created successfully!");
              onClose();
            }}
            className="bg-primary text-on-primary h-[44px] px-8 font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow"
          >
            Schedule Transfer
          </Button>
        </div>

      </div>
    </div>
  );
}
