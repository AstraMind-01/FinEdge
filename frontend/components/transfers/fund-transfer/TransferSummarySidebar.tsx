"use client";

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Shield, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Account, Beneficiary } from '../../../types';
import SupportChatModal from '../../modals/SupportChatModal';

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
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  };

  const isRecipientAccount = toRecipient && 'balance' in toRecipient;
  const numAmount = parseFloat(amount) || 0;
  const totalDeduction = numAmount + fee;
  const remainingBalance = fromAccount ? Math.max(0, fromAccount.balance - totalDeduction) : 0;

  const handleReportFraud = () => {
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 3000);
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
        
        {reportSuccess && (
          <div className="p-3 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-2 text-tertiary text-xs font-medium">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Security team alerted. Account session secured.</span>
          </div>
        )}

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

            {currentStep >= 2 && (
              <>
                <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20"></div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-on-surface-variant">Transfer Amount</span>
                    <span className="text-[14px] font-semibold text-on-surface font-mono">{amount ? formatCurrency(amount) : '₹0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-on-surface-variant">Transfer Mode</span>
                    <span className="text-[13px] font-medium text-on-surface">{transferMode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-on-surface-variant">Bank Fee</span>
                    <span className="text-[13px] font-medium text-on-surface font-mono">{fee > 0 ? formatCurrency(fee) : 'Free'}</span>
                  </div>
                  
                  <div className="mt-2 pt-3 border-t border-outline-variant/10 flex items-center justify-between">
                    <span className="text-[14px] font-bold text-on-surface">Total Deduction</span>
                    <span className="text-[18px] font-display-sm font-bold text-primary font-mono">{formatCurrency(totalDeduction)}</span>
                  </div>

                  {fromAccount && (
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                      <span>Est. Remaining Balance</span>
                      <span className="font-mono text-tertiary font-medium">{formatCurrency(remainingBalance)}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Need Help? */}
        <Card className="p-4 flex flex-col gap-3 bg-surface-container-low shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <MessageSquare size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold text-on-surface">Having trouble?</span>
              <span className="text-[11px] text-on-surface-variant">Our support team is here to help</span>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className="w-full py-2.5 rounded-xl border border-primary/40 text-primary font-semibold text-xs hover:bg-primary/10 transition-all flex items-center justify-center gap-2 mt-1 shadow-sm"
          >
            Chat with Support
          </button>
        </Card>

        {/* Security Tip */}
        <Card className="p-4 flex flex-col gap-2 bg-surface-container-low shadow-sm border border-outline-variant/10 hover:border-tertiary/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-tertiary" />
              <span className="text-[12px] font-bold text-on-surface">Security Tip</span>
            </div>
            <button 
              type="button"
              onClick={handleReportFraud}
              className="text-[10px] text-error hover:underline font-medium"
            >
              Report Suspicious
            </button>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Never share your OTP, PIN, or password with anyone, including bank staff. FinEdge will never ask for these details over a call.
          </p>
        </Card>

      </div>

      <SupportChatModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
}
