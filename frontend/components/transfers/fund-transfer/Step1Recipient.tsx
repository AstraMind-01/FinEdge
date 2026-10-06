"use client";

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Account, Beneficiary } from '../../../types';
import { ArrowLeftRight, Landmark, Briefcase, Search, Plus, CheckCircle2, User, Smartphone, AlertCircle, Loader2 } from 'lucide-react';
import { useAccounts } from '../../../context/AccountContext';

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
  const { isAccountVerified } = useAccounts();
  const [activeTab, setActiveTab] = useState("Own Accounts");
  const tabs = ["Own Accounts", "Saved Beneficiary", "New Recipient", "UPI ID / Mobile"];

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // New Recipient Form state
  const [newRecName, setNewRecName] = useState("");
  const [newRecBank, setNewRecBank] = useState("");
  const [newRecAccount, setNewRecAccount] = useState("");
  const [newRecIfsc, setNewRecIfsc] = useState("");
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);

  // UPI State
  const [upiInput, setUpiInput] = useState("");
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiVerifiedName, setUpiVerifiedName] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const handleSwapAccounts = () => {
    if (fromAccount && toRecipient && 'type' in toRecipient) {
      const temp = fromAccount;
      onFromAccountSelect(toRecipient as Account);
      onToRecipientSelect(temp);
    } else if (fromAccount) {
      const otherAcc = accounts.find(a => a.id !== fromAccount.id);
      if (otherAcc) {
        onToRecipientSelect(otherAcc);
      }
    }
  };

  const handleCreateNewRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecName.trim() || !newRecAccount.trim() || !newRecIfsc.trim()) return;

    const newBen: Beneficiary = {
      id: `BEN-${Date.now()}`,
      name: newRecName.trim(),
      bankName: newRecBank.trim() || "Bank Account",
      accountNumber: newRecAccount.trim(),
      ifsc: newRecIfsc.trim().toUpperCase()
    };
    onToRecipientSelect(newBen);
  };

  const handleVerifyUpi = async () => {
    if (!upiInput.trim()) return;
    setIsVerifyingUpi(true);
    await new Promise(r => setTimeout(r, 600));
    const resolvedName = upiInput.includes("@") ? upiInput.split("@")[0].toUpperCase() : "VERIFIED UPI USER";
    setUpiVerifiedName(resolvedName);
    setIsVerifyingUpi(false);

    const upiBen: Beneficiary = {
      id: `UPI-${Date.now()}`,
      name: resolvedName,
      bankName: "UPI",
      accountNumber: upiInput.trim(),
      ifsc: "UPI",
      upiId: upiInput.trim()
    };
    onToRecipientSelect(upiBen);
  };

  const filteredBeneficiaries = beneficiaries.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isComplete = !!fromAccount && !!toRecipient;

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar bg-surface-container-low border-b border-outline-variant/10">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
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
        
        {/* From Account Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer From</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map(acc => {
              const isSelected = fromAccount?.id === acc.id;
              return (
                <div 
                  key={acc.id}
                  onClick={() => onFromAccountSelect(acc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(240,180,41,0.15)]' 
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
                    <span className="font-bold text-[14px] text-tertiary font-mono">{isAccountVerified(acc.id) ? formatCurrency(acc.balance) : "••••••••"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Swap Button Divider */}
        <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20 my-2 relative flex justify-center">
          <button 
            type="button"
            onClick={handleSwapAccounts}
            title="Swap Source & Destination Accounts"
            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all duration-200 shadow-md z-10 -translate-y-5"
          >
            <ArrowLeftRight size={16} className="rotate-90" />
          </button>
        </div>

        {/* To Recipient Selection based on Active Tab */}
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer To</label>
          
          {/* TAB: OWN ACCOUNTS */}
          {activeTab === "Own Accounts" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.filter(a => a.id !== fromAccount?.id).map(acc => {
                const isSelected = toRecipient?.id === acc.id;
                return (
                  <div 
                    key={acc.id}
                    onClick={() => onToRecipientSelect(acc)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(240,180,41,0.15)]' 
                        : 'border-outline-variant/20 bg-surface hover:border-outline-variant/40 hover:bg-surface-high'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-on-surface truncate">{acc.name}</span>
                      <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">{acc.type}</span>
                    </div>
                    <span className="text-[12px] text-on-surface-variant font-mono">{acc.maskedNumber}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-on-surface-variant">Available Balance</span>
                      <span className="font-bold text-[14px] text-on-surface font-mono">{isAccountVerified(acc.id) ? formatCurrency(acc.balance) : "••••••••"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: SAVED BENEFICIARY */}
          {activeTab === "Saved Beneficiary" && (
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-on-surface-variant" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[44px] bg-surface pl-10 pr-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Search beneficiaries by name or bank..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredBeneficiaries.map(ben => {
                  const isSelected = toRecipient?.id === ben.id;
                  return (
                    <div 
                      key={ben.id}
                      onClick={() => onToRecipientSelect(ben)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
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
                          <span className="text-[11px] text-on-surface-variant font-mono">{ben.bankName} • {ben.accountNumber}</span>
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

          {/* TAB: NEW RECIPIENT */}
          {activeTab === "New Recipient" && (
            <form onSubmit={handleCreateNewRecipient} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Recipient Name</label>
                  <input 
                    type="text" 
                    required
                    value={newRecName}
                    onChange={(e) => setNewRecName(e.target.value)}
                    className="w-full h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" 
                    placeholder="Full name as per bank" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Bank Name</label>
                  <input 
                    type="text" 
                    required
                    value={newRecBank}
                    onChange={(e) => setNewRecBank(e.target.value)}
                    className="w-full h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" 
                    placeholder="e.g. HDFC Bank" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Account Number</label>
                  <input 
                    type="text" 
                    required
                    value={newRecAccount}
                    onChange={(e) => setNewRecAccount(e.target.value)}
                    className="w-full h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 font-mono" 
                    placeholder="Account Number" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">IFSC Code</label>
                  <input 
                    type="text" 
                    required
                    value={newRecIfsc}
                    onChange={(e) => setNewRecIfsc(e.target.value.toUpperCase())}
                    className="w-full h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 font-mono uppercase" 
                    placeholder="e.g. HDFC0001234" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="saveBen" 
                  checked={saveBeneficiary}
                  onChange={(e) => setSaveBeneficiary(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary/50" 
                />
                <label htmlFor="saveBen" className="text-[12px] text-on-surface font-medium cursor-pointer">Save as Beneficiary for future transfers</label>
              </div>

              <Button 
                type="submit"
                className="w-full mt-2 h-11 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all text-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add &amp; Use Recipient
              </Button>
            </form>
          )}

          {/* TAB: UPI ID / MOBILE */}
          {activeTab === "UPI ID / Mobile" && (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-low gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Smartphone size={22} />
              </div>
              <span className="text-[14px] font-semibold text-on-surface">Transfer to UPI ID or Mobile Number</span>
              <p className="text-[12px] text-on-surface-variant max-w-[320px]">Send money instantly to anyone using their UPI ID (e.g. 9876543210@paytm) or linked mobile number.</p>
              
              <div className="flex w-full max-w-[360px] gap-2 mt-2">
                <input 
                  type="text" 
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  className="flex-1 h-[44px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 font-mono" 
                  placeholder="Enter UPI ID or Mobile" 
                />
                <Button 
                  onClick={handleVerifyUpi}
                  disabled={isVerifyingUpi || !upiInput.trim()}
                  className="bg-primary text-on-primary h-[44px] px-6 font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all shrink-0"
                >
                  {isVerifyingUpi ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
                </Button>
              </div>

              {upiVerifiedName && (
                <div className="mt-2 text-xs font-semibold text-tertiary flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Verified Name: {upiVerifiedName}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between">
        <button 
          type="button" 
          className="text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors" 
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <Button 
          disabled={!isComplete}
          onClick={onNext}
          className="bg-primary text-on-primary h-[44px] px-8 font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow disabled:opacity-40"
        >
          Continue
        </Button>
      </div>

    </Card>
  );
}
