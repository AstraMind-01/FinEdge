import React from 'react';
import { Card } from '../../ui/card';
import { Shield, MessageSquare, AlertCircle } from 'lucide-react';
import { Account, Beneficiary } from '../../../types';

interface TransferSummarySidebarProps {
  currentStep: number;
  fromAccount?: Account;
  toRecipient?: Beneficiary | Account;
  amount: string;
  transferMode: string;
  fee: number;
}

export default function TransferSummarySidebar({ 
  currentStep, fromAccount, toRecipient, amount, transferMode, fee 
}: TransferSummarySidebarProps) {
  
  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  };

  const isRecipientAccount = toRecipient && 'balance' in toRecipient;

  return (
    <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
      
      {/* Transfer Summary */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <h3 className="font-title-md font-semibold text-on-surface border-b border-outline-variant/10 pb-3">Transfer Summary</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">From Account</span>
            <span className="text-[14px] font-semibold text-on-surface">{fromAccount?.name || 'Not selected'}</span>
            {fromAccount && <span className="text-[12px] text-on-surface-variant font-mono">{fromAccount.maskedNumber}</span>}
          </div>

          <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20"></div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">To Recipient</span>
            <span className="text-[14px] font-semibold text-on-surface">{toRecipient?.name || 'Not selected'}</span>
            {toRecipient && (
              <span className="text-[12px] text-on-surface-variant font-mono">
                {isRecipientAccount ? (toRecipient as Account).maskedNumber : (toRecipient as Beneficiary).bankName}
              </span>
            )}
          </div>

          <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20"></div>

          {currentStep >= 2 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">Amount</span>
                <span className="text-[14px] font-semibold text-on-surface">{amount ? formatCurrency(amount) : '₹0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">Transfer Mode</span>
                <span className="text-[13px] font-medium text-on-surface">{transferMode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">Estimated Fee</span>
                <span className="text-[13px] font-medium text-on-surface">{fee > 0 ? formatCurrency(fee) : 'Free'}</span>
              </div>
              
              <div className="mt-2 pt-3 border-t border-outline-variant/10 flex items-center justify-between">
                <span className="text-[14px] font-bold text-on-surface">Total Debit</span>
                <span className="text-[18px] font-display-sm font-bold text-primary">{formatCurrency((parseFloat(amount) || 0) + fee)}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Need Help? */}
      <Card className="p-4 flex flex-col gap-3 bg-surface-container-low shadow-sm border border-outline-variant/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-outline-variant/10">
            <MessageSquare size={16} className="text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-on-surface">Having trouble?</span>
            <span className="text-[11px] text-on-surface-variant">Our support team is here to help</span>
          </div>
        </div>
        <button className="text-[12px] font-semibold text-primary hover:underline text-left mt-1">Chat with Support</button>
      </Card>

      {/* Security Tip */}
      <Card className="p-4 flex flex-col gap-2 bg-gradient-to-r from-surface-container-high to-surface-container shadow-sm border border-outline-variant/10 group">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-tertiary" />
          <span className="text-[12px] font-bold text-on-surface">Security Tip</span>
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          Never share your OTP, PIN, or password with anyone, including bank staff. FinEdge will never ask for these details over a call.
        </p>
      </Card>

    </div>
  );
}
