import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Account, Beneficiary } from '../../../types';
import { Lock, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface Step3ReviewProps {
  fromAccount?: Account;
  toRecipient?: Beneficiary | Account;
  amount: string;
  transferMode: string;
  fee: number;
  onNext: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

export default function Step3Review({
  fromAccount, toRecipient, amount, transferMode, fee, onNext, onBack, onEdit
}: Step3ReviewProps) {

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  };

  const isRecipientAccount = toRecipient && 'balance' in toRecipient;
  const numericAmount = parseFloat(amount) || 0;
  const totalAmount = numericAmount + fee;

  const handleConfirm = () => {
    setIsVerifying(true);
    // Simulate API call for OTP verification
    setTimeout(() => {
      setIsVerifying(false);
      onNext();
    }, 1500);
  };

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden">
      
      <div className="p-6 md:p-10 flex flex-col items-center gap-8 min-h-[400px]">
        
        {/* Summary Card */}
        <div className="w-full max-w-lg bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 flex flex-col gap-6 shadow-sm">
          
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer Amount</span>
              <span className="font-display-md text-[28px] font-bold text-on-surface leading-none">{formatCurrency(amount)}</span>
            </div>
            <button className="text-[12px] font-semibold text-primary hover:underline" onClick={() => onEdit(2)}>Edit</button>
          </div>

          <div className="flex flex-col gap-4">
            
            <div className="flex items-start justify-between group">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">From Account</span>
                <span className="text-[14px] font-semibold text-on-surface">{fromAccount?.name}</span>
                <span className="text-[12px] text-on-surface-variant font-mono">{fromAccount?.maskedNumber}</span>
              </div>
              <button className="text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline" onClick={() => onEdit(1)}>Edit</button>
            </div>

            <div className="w-8 h-8 rounded-full bg-surface border border-outline-variant/20 flex items-center justify-center text-on-surface-variant my-[-10px] ml-2 relative z-10">
              <ArrowRight size={14} className="rotate-90" />
            </div>

            <div className="flex items-start justify-between group">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">To Recipient</span>
                <span className="text-[14px] font-semibold text-on-surface">{toRecipient?.name}</span>
                <span className="text-[12px] text-on-surface-variant font-mono">
                  {isRecipientAccount ? (toRecipient as Account).maskedNumber : (toRecipient as Beneficiary).bankName}
                </span>
              </div>
              <button className="text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline" onClick={() => onEdit(1)}>Edit</button>
            </div>

          </div>

          <div className="pt-4 border-t border-dashed border-outline-variant/20 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-on-surface-variant">Transfer Mode</span>
              <span className="font-medium text-on-surface">{transferMode}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-on-surface-variant">Estimated Fee</span>
              <span className="font-medium text-on-surface">{fee > 0 ? formatCurrency(fee) : 'Free'}</span>
            </div>
            <div className="flex items-center justify-between text-[14px] font-bold pt-2">
              <span className="text-on-surface">Total Debit</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

        </div>

        {/* OTP Section */}
        <div className="w-full max-w-lg flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-outline-variant/20 shadow-sm text-tertiary mb-2">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-[18px] font-bold text-on-surface">Verify with OTP</h3>
            <p className="text-[13px] text-on-surface-variant">Enter the 6-digit code sent to your registered mobile number ending in •••• 9812.</p>
          </div>
          
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-[200px] h-[56px] text-center bg-surface rounded-xl border border-outline-variant/30 font-mono text-[24px] font-bold tracking-[0.5em] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="••••••"
          />
          
          <div className="flex items-center justify-center gap-2 text-[12px] font-medium mt-2">
            {countdown > 0 ? (
              <span className="text-on-surface-variant">Resend OTP in {countdown}s</span>
            ) : (
              <button 
                className="text-primary hover:underline flex items-center gap-1.5"
                onClick={() => { setCountdown(60); setOtp(""); }}
              >
                <RefreshCw size={12} /> Resend OTP Now
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button className="text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors order-2 sm:order-1" onClick={onBack}>
          Back to Edit
        </button>
        <Button 
          disabled={otp.length !== 6 || isVerifying}
          onClick={handleConfirm}
          className="w-full sm:w-auto bg-primary text-on-primary h-[48px] px-8 font-bold hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
        >
          {isVerifying ? (
            <>
              <RefreshCw size={18} className="animate-spin" /> Verifying...
            </>
          ) : (
            <>
              <Lock size={18} /> Confirm & Transfer
            </>
          )}
        </Button>
      </div>

    </Card>
  );
}
