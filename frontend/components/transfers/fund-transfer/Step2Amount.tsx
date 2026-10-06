import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { IndianRupee } from 'lucide-react';
import { Account } from '../../../types';
import { useAccounts } from '../../../context/AccountContext';

interface Step2AmountProps {
  amount: string;
  setAmount: (val: string) => void;
  transferMode: string;
  setTransferMode: (val: string) => void;
  fromAccount?: Account;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Amount({
  amount, setAmount, transferMode, setTransferMode, fromAccount, onNext, onBack
}: Step2AmountProps) {
  const { isAccountVerified } = useAccounts();
  const isComplete = parseFloat(amount) > 0 && parseFloat(amount) <= (fromAccount?.balance || Infinity);
  const quickAmounts = [500, 1000, 5000, 10000, 25000];

  const transferModes = [
    { id: "IMPS", label: "IMPS", time: "Instant", fee: 5 },
    { id: "NEFT", label: "NEFT", time: "2-4 hours", fee: 0 },
    { id: "RTGS", label: "RTGS", time: "Same day (₹2L+)", fee: 0 }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <Card className="bg-surface-container border border-outline-variant/20 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface font-headline-md tracking-tight">Enter Transfer Amount &amp; Mode</h2>
        <p className="text-xs text-on-surface-variant mt-1">Specify how much to send and choose your payment processing engine.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-4 bg-surface-container-high border border-outline-variant/10 rounded-2xl p-6">
        <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-3">Transfer Amount</span>
        <div className="relative w-full max-w-sm">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <IndianRupee size={32} className="text-on-surface-variant" />
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-[80px] bg-surface pl-16 pr-6 rounded-2xl border border-outline-variant/20 font-display-lg text-[40px] font-bold text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-center"
            placeholder="0"
          />
        </div>
        {fromAccount && (
          <div className="mt-3 flex items-center gap-2 text-[13px]">
            <span className="text-on-surface-variant">Available Balance:</span>
            <span className="font-semibold text-tertiary">
              {isAccountVerified(fromAccount.id) ? formatCurrency(fromAccount.balance) : "••••••••"}
            </span>
          </div>
        )}
          
          <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className="px-4 py-2 rounded-full text-[13px] font-semibold bg-surface border border-outline-variant/20 text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
              >
                +{formatCurrency(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Transfer Modes */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer Mode</label>
          <div className="flex flex-col gap-3">
            {transferModes.map(mode => (
              <div 
                key={mode.id}
                onClick={() => setTransferMode(mode.id)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  transferMode === mode.id 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                    : 'border-outline-variant/20 bg-surface hover:border-outline-variant/40 hover:bg-surface-high'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full border border-outline-variant/40 flex items-center justify-center shrink-0">
                    {transferMode === mode.id && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-bold text-[14px] ${transferMode === mode.id ? 'text-primary' : 'text-on-surface'}`}>{mode.label}</span>
                    <span className="text-[12px] text-on-surface-variant font-medium">{mode.time}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[13px] font-semibold text-on-surface">{mode.fee === 0 ? 'Free' : formatCurrency(mode.fee)}</span>
                  <span className="text-[11px] text-on-surface-variant">Fee</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Note */}
        <div className="w-full max-w-md flex flex-col gap-2">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Add a Note (Optional)</label>
          <input
            type="text"
            className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 transition-all"
            placeholder="e.g., Rent, Dinner, Gift"
          />
        </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between">
        <button className="text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors" onClick={onBack}>
          Back
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
