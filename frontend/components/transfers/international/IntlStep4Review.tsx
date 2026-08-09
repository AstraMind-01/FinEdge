import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { IntlBeneficiary, ExchangeRate } from '../../../types';
import { Lock, RefreshCw, ShieldCheck } from 'lucide-react';

interface IntlStep4ReviewProps {
  recipient: IntlBeneficiary | null;
  amountInr: string;
  targetCurrency: string;
  exchangeRates: ExchangeRate[];
  purpose: string;
  onNext: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

export default function IntlStep4Review({
  recipient, amountInr, targetCurrency, exchangeRates, purpose, onNext, onBack, onEdit
}: IntlStep4ReviewProps) {

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

  const currentRate = exchangeRates.find(r => r.currency === targetCurrency)?.rate || 83.42;
  const inrValue = parseFloat(amountInr) || 0;
  const foreignValue = inrValue > 0 ? (inrValue / currentRate).toFixed(2) : "0.00";
  const transferFee = inrValue > 0 ? Math.max(500, inrValue * 0.005) : 0;
  const gst = transferFee * 0.18;
  const totalPayable = inrValue + transferFee + gst;

  const formatCurrency = (val: number | string, curr = "INR") => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: curr, maximumFractionDigits: curr === "INR" ? 0 : 2 }).format(num);
  };

  const handleConfirm = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onNext();
    }, 2000);
  };

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden min-h-[500px]">
      
      <div className="p-6 md:p-10 flex flex-col items-center gap-8 flex-1">
        
        {/* Comprehensive Summary Card */}
        <div className="w-full max-w-lg bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 flex flex-col gap-6 shadow-sm">
          
          {/* Header - Amount Received */}
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10 group">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Recipient Gets</span>
              <span className="font-display-md text-[28px] font-bold text-primary leading-none">{formatCurrency(foreignValue, targetCurrency)}</span>
            </div>
            <button className="text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline" onClick={() => onEdit(2)}>Edit Amount</button>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            
            <div className="flex items-start justify-between group">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">Recipient Details</span>
                <span className="text-[14px] font-semibold text-on-surface">{recipient?.name}</span>
                <span className="text-[12px] text-on-surface-variant">Bank: {recipient?.bankName}</span>
                <span className="text-[12px] text-on-surface-variant font-mono">IBAN/AC: {recipient?.iban}</span>
                <span className="text-[12px] text-on-surface-variant font-mono">SWIFT: {recipient?.swiftCode}</span>
              </div>
              <button className="text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline" onClick={() => onEdit(1)}>Edit</button>
            </div>

            <div className="flex items-start justify-between group pt-4 border-t border-dashed border-outline-variant/20">
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">Transfer Details</span>
                
                <div className="flex justify-between items-center text-[13px] mt-1">
                  <span className="text-on-surface-variant">Exchange Rate applied</span>
                  <span className="font-medium text-on-surface">1 {targetCurrency} = {formatCurrency(currentRate)}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Purpose</span>
                  <span className="font-medium text-on-surface">{purpose}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Est. Delivery</span>
                  <span className="font-medium text-tertiary">2-4 Business Days</span>
                </div>

              </div>
              <button className="text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline ml-2 shrink-0" onClick={() => onEdit(3)}>Edit</button>
            </div>

          </div>

          {/* Final Cost */}
          <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-3 bg-surface p-4 -mx-6 -mb-6 rounded-b-2xl">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-on-surface-variant">Amount Sent (INR)</span>
              <span className="font-medium text-on-surface">{formatCurrency(inrValue)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-on-surface-variant">Fees & Taxes</span>
              <span className="font-medium text-on-surface">{formatCurrency(transferFee + gst)}</span>
            </div>
            <div className="flex items-center justify-between text-[14px] font-bold pt-2 border-t border-dashed border-outline-variant/20 mt-1">
              <span className="text-on-surface">Total Debit</span>
              <span className="text-primary">{formatCurrency(totalPayable)}</span>
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
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
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
              <RefreshCw size={18} className="animate-spin" /> Verifying Transfer...
            </>
          ) : (
            <>
              <Lock size={18} /> Confirm & Send International
            </>
          )}
        </Button>
      </div>

    </Card>
  );
}
