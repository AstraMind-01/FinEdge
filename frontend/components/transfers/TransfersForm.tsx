"use client";
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar as CalendarIcon, Clock, Search, IndianRupee, Send } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { MockApi } from '../../lib/mockApi';
import { Account, Beneficiary } from '../../types';

export default function TransfersForm() {
  const [activeTab, setActiveTab] = useState("Other Bank Account");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [scheduleToggle, setScheduleToggle] = useState(false);
  const [transferMode, setTransferMode] = useState("IMPS");

  useEffect(() => {
    const fetchData = async () => {
      const [accs, bens] = await Promise.all([
        MockApi.getAccounts(),
        MockApi.getBeneficiaries()
      ]);
      setAccounts(accs.filter(a => a.type === 'SAVINGS' || a.type === 'CURRENT'));
      setBeneficiaries(bens);
    };
    fetchData();
  }, []);

  const tabs = ["Own Account", "Other Bank Account", "UPI / Mobile", "International"];
  const quickAmounts = [1000, 5000, 10000];
  
  const transferModes = [
    { id: "IMPS", label: "IMPS", time: "Instant" },
    { id: "NEFT", label: "NEFT", time: "2-4 hours" },
    { id: "RTGS", label: "RTGS", time: "Instant" },
    { id: "UPI", label: "UPI", time: "Instant" }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const numericAmount = parseFloat(amount) || 0;
  const fee = transferMode === "IMPS" && numericAmount > 0 ? 5 : 0;
  const totalAmount = numericAmount + fee;

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

      <div className="p-6 flex flex-col gap-8">
        
        {/* Transfer From */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer From</label>
          <Select defaultValue={accounts.length > 0 ? accounts[0].id : ""}>
            <SelectTrigger className="w-full bg-surface border-outline-variant/20 h-[60px] rounded-xl px-4">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>
                  <div className="flex items-center justify-between w-full min-w-[250px]">
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-[14px]">{acc.name}</span>
                      <span className="text-[12px] text-on-surface-variant font-mono">{acc.maskedNumber}</span>
                    </div>
                    <span className="font-bold text-[14px] text-tertiary pl-4">{formatCurrency(acc.balance)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transfer To */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer To</label>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
            {beneficiaries.map(ben => (
              <div key={ben.id} className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-[16px] font-bold text-on-surface-variant group-hover:border-primary group-hover:text-primary transition-colors">
                  {ben.name.charAt(0)}
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium truncate w-[60px] text-center">{ben.name.split(' ')[0]}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0">
              <div className="w-12 h-12 rounded-full bg-surface-container-low border border-dashed border-outline-variant/40 flex items-center justify-center text-on-surface-variant group-hover:border-primary group-hover:text-primary transition-colors">
                <Search size={18} />
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium truncate w-[60px] text-center">Search</span>
            </div>
          </div>

          <div className="relative mt-1">
            <input
              type="text"
              className="w-full h-[52px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[14px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="Enter Account Number, UPI ID, or Name..."
            />
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IndianRupee size={24} className="text-on-surface-variant" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-[72px] bg-surface pl-12 pr-4 rounded-xl border border-outline-variant/20 font-display-lg text-[32px] font-bold text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-center gap-2 mt-1">
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-surface border border-outline-variant/20 text-on-surface-variant hover:bg-surface-high hover:text-on-surface hover:border-outline-variant/40 transition-colors"
              >
                +{formatCurrency(amt)}
              </button>
            ))}
            <button
              onClick={() => setAmount("")}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-surface border border-outline-variant/20 text-on-surface-variant hover:bg-surface-high hover:text-on-surface hover:border-outline-variant/40 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Remarks */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Remarks (Optional)</label>
          <input
            type="text"
            className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            placeholder="What is this for?"
          />
        </div>

        {/* Transfer Mode */}
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer Mode</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {transferModes.map(mode => (
              <div 
                key={mode.id}
                onClick={() => setTransferMode(mode.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                  transferMode === mode.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-outline-variant/20 bg-surface hover:border-outline-variant/40 hover:bg-surface-high'
                }`}
              >
                <span className={`font-bold text-[14px] ${transferMode === mode.id ? 'text-primary' : 'text-on-surface'}`}>{mode.label}</span>
                <span className={`text-[11px] font-medium ${transferMode === mode.id ? 'text-primary/80' : 'text-on-surface-variant'}`}>{mode.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setScheduleToggle(!scheduleToggle)}>
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className={scheduleToggle ? 'text-primary' : 'text-on-surface-variant'} />
              <span className="font-semibold text-[14px] text-on-surface">Schedule for later</span>
            </div>
            <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${scheduleToggle ? 'bg-primary' : 'bg-surface-container-high border border-outline-variant/30'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${scheduleToggle ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>
          
          {scheduleToggle && (
            <div className="pt-4 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-4 mt-2">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] text-on-surface-variant font-medium">Date</label>
                <input type="date" className="w-full h-[40px] bg-surface px-3 rounded-lg border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] text-on-surface-variant font-medium">Frequency</label>
                <select className="w-full h-[40px] bg-surface px-3 rounded-lg border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50">
                  <option>Once</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer Summary */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-on-surface-variant">Transfer Amount</span>
          <span className="text-[14px] font-semibold text-on-surface">{formatCurrency(numericAmount)}</span>
        </div>
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
          <span className="text-[13px] text-on-surface-variant">Bank Fees</span>
          <span className="text-[14px] font-medium text-on-surface">{fee > 0 ? formatCurrency(fee) : 'Free'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-on-surface">Total to pay</span>
          <span className="text-[20px] font-display-sm font-bold text-on-surface">{formatCurrency(totalAmount)}</span>
        </div>
        
        <Button 
          className="w-full h-[56px] text-[16px] font-bold bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all mt-2 flex items-center justify-center gap-2"
          onClick={() => alert("Transfer initiated successfully!")}
        >
          Review & Send <Send size={18} />
        </Button>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <ShieldCheck size={14} className="text-tertiary" />
          <span className="text-[11px] text-on-surface-variant font-medium">Protected by 256-bit encryption & OTP verification</span>
        </div>
      </div>

    </Card>
  );
}
