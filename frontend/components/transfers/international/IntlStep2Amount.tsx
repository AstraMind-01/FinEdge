import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { IndianRupee, ArrowDownUp, Clock, Info } from 'lucide-react';
import { ExchangeRate } from '../../../types';

interface IntlStep2AmountProps {
  amountInr: string;
  setAmountInr: (val: string) => void;
  targetCurrency: string;
  setTargetCurrency: (val: string) => void;
  exchangeRates: ExchangeRate[];
  onNext: () => void;
  onBack: () => void;
}

export default function IntlStep2Amount({
  amountInr, setAmountInr, targetCurrency, setTargetCurrency, exchangeRates, onNext, onBack
}: IntlStep2AmountProps) {

  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const currentRate = exchangeRates.find(r => r.currency === targetCurrency)?.rate || 83.42;
  
  const inrValue = parseFloat(amountInr) || 0;
  const foreignValue = inrValue > 0 ? (inrValue / currentRate).toFixed(2) : "0.00";

  const transferFee = inrValue > 0 ? Math.max(500, inrValue * 0.005) : 0; // 0.5% or min ₹500
  const gst = transferFee * 0.18;
  const totalPayable = inrValue + transferFee + gst;

  const formatCurrency = (val: number, curr = "INR") => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: curr, maximumFractionDigits: curr === "INR" ? 0 : 2 }).format(val);
  };

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden min-h-[500px]">
      
      <div className="p-6 sm:p-10 flex flex-col items-center gap-8 flex-1">
        
        {/* Dual Input Section */}
        <div className="w-full max-w-md relative flex flex-col gap-2">
          
          {/* You Send */}
          <div className="w-full bg-surface rounded-2xl border border-outline-variant/30 p-4 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">You Send</span>
              <span className="text-[12px] font-medium text-on-surface-variant flex items-center gap-1"><IndianRupee size={12}/> INR</span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                value={amountInr}
                onChange={(e) => setAmountInr(e.target.value)}
                className="w-full bg-transparent font-display-md text-[32px] font-bold text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none"
                placeholder="0"
              />
              <div className="flex items-center gap-2 pl-4 border-l border-outline-variant/20">
                <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-[14px]">🇮🇳</div>
                <span className="font-bold text-on-surface">INR</span>
              </div>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-10 h-10 rounded-full bg-surface-container-high border-4 border-surface-container flex items-center justify-center text-on-surface-variant shadow-sm">
              <ArrowDownUp size={16} />
            </div>
          </div>

          {/* They Receive */}
          <div className="w-full bg-surface-container-low rounded-2xl border border-outline-variant/20 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">They Receive</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display-md text-[32px] font-bold text-primary">{foreignValue}</span>
              
              <div className="flex items-center gap-2 pl-4 border-l border-outline-variant/20 shrink-0">
                <select 
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer appearance-none flex items-center"
                >
                  {exchangeRates.map(r => (
                    <option key={r.currency} value={r.currency}>
                      {getFlagEmoji(r.countryCode)} {r.currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Live Rate Lock */}
        <div className="w-full max-w-md flex items-center justify-between p-3 rounded-xl bg-secondary/5 border border-secondary/20">
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-secondary/80">Live Exchange Rate</span>
            <span className="font-bold text-[14px] text-secondary">1 {targetCurrency} = {formatCurrency(currentRate, "INR")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <Clock size={16} />
            <span className="text-[13px] font-bold font-mono">Rate locked for {formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Fee Breakdown */}
        {inrValue > 0 && (
          <div className="w-full max-w-md flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/20 bg-surface">
            <h4 className="text-[12px] font-bold text-on-surface uppercase tracking-wider mb-2">Transfer Breakdown</h4>
            
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-on-surface-variant">Amount to Transfer</span>
              <span className="font-medium text-on-surface">{formatCurrency(inrValue)}</span>
            </div>
            
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-on-surface-variant flex items-center gap-1">Transfer Fee <Info size={12} /></span>
              <span className="font-medium text-on-surface">{formatCurrency(transferFee)}</span>
            </div>
            
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-on-surface-variant">GST (18%)</span>
              <span className="font-medium text-on-surface">{formatCurrency(gst)}</span>
            </div>
            
            <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20 my-1"></div>
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-[14px] text-on-surface">Total Amount Payable</span>
              <span className="font-bold text-[16px] text-primary">{formatCurrency(totalPayable)}</span>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between mt-auto">
        <button className="text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors" onClick={onBack}>
          Back
        </button>
        <Button 
          disabled={inrValue <= 0}
          onClick={onNext}
          className="bg-primary text-on-primary h-[44px] px-8 font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow"
        >
          Continue
        </Button>
      </div>

    </Card>
  );
}
