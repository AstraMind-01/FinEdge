import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Account, Beneficiary } from '../../../types';
import { ArrowLeftRight, Landmark, Briefcase, Search, Plus } from 'lucide-react';

interface Step1RecipientProps {
  accounts: Account[];
  beneficiaries: Beneficiary[];
  fromAccount?: Account;
  toRecipient?: Beneficiary | Account;
  onFromAccountSelect: (acc: Account) => void;
  onToRecipientSelect: (rec: Beneficiary | Account) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function Step1Recipient({
  accounts, beneficiaries, fromAccount, toRecipient, onFromAccountSelect, onToRecipientSelect, onNext, onCancel
}: Step1RecipientProps) {
  const [activeTab, setActiveTab] = useState("Saved Beneficiary");
  const tabs = ["Own Accounts", "Saved Beneficiary", "New Recipient", "UPI ID / Mobile"];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const isComplete = fromAccount && toRecipient;

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar bg-surface-container-low border-b border-outline-variant/10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 flex flex-col gap-6 min-h-[400px]">
        
        {/* From Account Selection - Global across tabs */}
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer From</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map(acc => (
              <div 
                key={acc.id}
                onClick={() => onFromAccountSelect(acc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
                  fromAccount?.id === acc.id 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                    : 'border-outline-variant/20 bg-surface hover:border-outline-variant/40 hover:bg-surface-high'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/10 text-on-surface-variant">
                    {acc.type === 'SAVINGS' ? <Landmark size={14} /> : <Briefcase size={14} />}
                  </div>
                  <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">{acc.type}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[14px] text-on-surface truncate">{acc.name}</span>
                  <span className="text-[12px] text-on-surface-variant font-mono">{acc.maskedNumber}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-on-surface-variant">Available Balance</span>
                  <span className="font-bold text-[14px] text-tertiary">{formatCurrency(acc.balance)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20 my-2 relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant z-10">
            <ArrowLeftRight size={14} className="rotate-90" />
          </div>
        </div>

        {/* To Recipient Selection based on Active Tab */}
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer To</label>
          
          {activeTab === "Saved Beneficiary" && (
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-on-surface-variant" />
                </div>
                <input
                  type="text"
                  className="w-full h-[44px] bg-surface pl-10 pr-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="Search beneficiaries by name or bank..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {beneficiaries.map(ben => {
                  const isSelected = toRecipient?.id === ben.id;
                  return (
                    <div 
                      key={ben.id}
                      onClick={() => onToRecipientSelect(ben)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                          : 'border-outline-variant/20 bg-surface hover:border-outline-variant/40 hover:bg-surface-high'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high border border-outline-variant/20 text-on-surface-variant'}`}>
                          {ben.name.charAt(0)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-[13px] text-on-surface truncate w-[120px]">{ben.name}</span>
                          <span className="text-[11px] text-on-surface-variant">{ben.bankName}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-outline-variant/40">
                        {isSelected && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "Own Accounts" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.filter(a => a.id !== fromAccount?.id).map(acc => (
                <div 
                  key={acc.id}
                  onClick={() => onToRecipientSelect(acc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
                    toRecipient?.id === acc.id 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'border-outline-variant/20 bg-surface hover:border-outline-variant/40 hover:bg-surface-high'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[14px] text-on-surface truncate">{acc.name}</span>
                    <span className="text-[12px] text-on-surface-variant font-mono">{acc.maskedNumber}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-on-surface-variant">Available Balance</span>
                    <span className="font-bold text-[14px] text-on-surface">{formatCurrency(acc.balance)}</span>
                  </div>
                </div>
              ))}
              {accounts.filter(a => a.id !== fromAccount?.id).length === 0 && (
                <div className="col-span-2 text-center p-6 text-[13px] text-on-surface-variant">
                  No other accounts available to transfer to.
                </div>
              )}
            </div>
          )}

          {activeTab === "New Recipient" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Recipient Name</label>
                  <input type="text" className="w-full h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" placeholder="Full name as per bank" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Bank Name</label>
                  <input type="text" className="w-full h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" placeholder="e.g. HDFC Bank" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Account Number</label>
                  <input type="text" className="w-full h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" placeholder="Account Number" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">IFSC Code</label>
                  <input type="text" className="w-full h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" placeholder="e.g. HDFC0001234" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="saveBen" className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary/50" />
                <label htmlFor="saveBen" className="text-[12px] text-on-surface font-medium cursor-pointer">Save as Beneficiary for future transfers</label>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2 border-primary text-primary hover:bg-primary/5"
                onClick={() => onToRecipientSelect({ id: 'NEW', name: 'New Recipient', bankName: 'Unknown Bank', accountNumber: 'xxxx-xxxx-0000', ifsc: 'UNKNOWN' })}
              >
                Use this Recipient
              </Button>
            </div>
          )}

          {activeTab === "UPI ID / Mobile" && (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-low gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <span className="font-bold text-on-surface-variant text-[16px]">@</span>
              </div>
              <span className="text-[14px] font-semibold text-on-surface">Transfer to UPI ID or Mobile Number</span>
              <p className="text-[12px] text-on-surface-variant max-w-[300px]">Send money instantly to anyone using their UPI ID (e.g., name@bank) or linked mobile number.</p>
              <input type="text" className="w-full max-w-[300px] h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface mt-2 text-center focus:outline-none focus:border-primary/50" placeholder="Enter UPI ID or Mobile Number" />
              <Button 
                className="mt-2"
                onClick={() => onToRecipientSelect({ id: 'UPI-NEW', name: 'UPI Recipient', bankName: 'UPI', accountNumber: 'UPI ID', ifsc: 'UPI' })}
              >
                Verify & Select
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between">
        <button className="text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors" onClick={onCancel}>
          Cancel
        </button>
        <Button 
          disabled={!isComplete}
          onClick={onNext}
          className="bg-primary text-on-primary h-[44px] px-8 font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow"
        >
          Continue
        </Button>
      </div>

    </Card>
  );
}
