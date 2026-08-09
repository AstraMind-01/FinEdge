import React from 'react';
import { Card } from '../../ui/card';
import { IntlBeneficiary, ExchangeRate } from '../../../types';
import { ShieldCheck, TrendingUp, TrendingDown, MessageSquareMore } from 'lucide-react';

interface IntlTransferRightSidebarProps {
  currentStep: number;
  recipient: IntlBeneficiary | null;
  amountInr: string;
  targetCurrency: string;
  exchangeRates: ExchangeRate[];
  purpose: string;
}

export default function IntlTransferRightSidebar({
  currentStep, recipient, amountInr, targetCurrency, exchangeRates, purpose
}: IntlTransferRightSidebarProps) {
  
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

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0 sticky top-24">
      
      {/* Transfer Summary */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <h3 className="font-title-md font-semibold text-on-surface pb-2 border-b border-outline-variant/10">Transfer Summary</h3>
        
        <div className="flex flex-col gap-3">
          
          <div className="flex justify-between items-start text-[13px]">
            <span className="text-on-surface-variant w-1/2">Recipient</span>
            <span className={`font-medium text-right ${recipient ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
              {recipient ? recipient.name : 'Not selected'}
            </span>
          </div>

          <div className="flex justify-between items-center text-[13px]">
            <span className="text-on-surface-variant">Send Amount</span>
            <span className="font-medium text-on-surface">{formatCurrency(inrValue)}</span>
          </div>

          <div className="flex justify-between items-center text-[13px]">
            <span className="text-on-surface-variant">They Receive</span>
            <span className="font-bold text-primary">{formatCurrency(foreignValue, targetCurrency)}</span>
          </div>

          <div className="flex justify-between items-center text-[13px]">
            <span className="text-on-surface-variant">Exchange Rate</span>
            <span className="font-medium text-on-surface">1 {targetCurrency} = {formatCurrency(currentRate)}</span>
          </div>

          <div className="flex justify-between items-center text-[13px]">
            <span className="text-on-surface-variant">Transfer Fee</span>
            <span className="font-medium text-on-surface">{inrValue > 0 ? formatCurrency(transferFee) : '---'}</span>
          </div>

          <div className="flex justify-between items-start text-[13px]">
            <span className="text-on-surface-variant w-1/2">Purpose</span>
            <span className={`font-medium text-right ${purpose ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
              {purpose || 'Not selected'}
            </span>
          </div>

          <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20 my-1"></div>
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-[14px] text-on-surface">Total Debit</span>
            <span className="font-bold text-[16px] text-on-surface">{formatCurrency(totalPayable)}</span>
          </div>

        </div>
      </Card>

      {/* Today's Exchange Rates */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <h3 className="font-title-md font-semibold text-on-surface pb-2 border-b border-outline-variant/10">Today's Rates (INR)</h3>
        
        <div className="flex flex-col gap-2">
          {exchangeRates.map(r => (
            <div key={r.currency} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <span className="text-[16px]">{getFlagEmoji(r.countryCode)}</span>
                <span className="font-bold text-[13px] text-on-surface">1 {r.currency}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-[13px] text-on-surface">{formatCurrency(r.rate)}</span>
                {r.trend === 'up' ? (
                  <TrendingUp size={14} className="text-tertiary" />
                ) : (
                  <TrendingDown size={14} className="text-error" />
                )}
              </div>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-on-surface-variant text-center mt-1">Rates are indicative and subject to change.</span>
      </Card>

      {/* Compliance Note */}
      <Card className="p-4 flex gap-3 bg-secondary/5 shadow-sm border border-secondary/20 rounded-xl">
        <ShieldCheck size={18} className="text-secondary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold text-secondary">Regulatory Compliance</span>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            All international transfers are processed in compliance with RBI's Liberalised Remittance Scheme (LRS) guidelines.
          </p>
        </div>
      </Card>

      {/* Help Note */}
      <Card className="p-4 flex gap-3 bg-surface shadow-sm border border-outline-variant/10 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group">
        <MessageSquareMore size={18} className="text-on-surface-variant group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold text-on-surface group-hover:text-primary transition-colors">Need Help?</span>
          <p className="text-[11px] text-on-surface-variant">
            Questions about exchange rates or documents? <span className="text-primary hover:underline">Chat with Support</span>
          </p>
        </div>
      </Card>

    </div>
  );
}
