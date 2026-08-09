import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Account, Beneficiary } from '../../../types';
import { CheckCircle2, Download, Share2, Plus, Home } from 'lucide-react';
import Link from 'next/link';

interface Step4SuccessProps {
  fromAccount?: Account;
  toRecipient?: Beneficiary | Account;
  amount: string;
  transferMode: string;
  fee: number;
  onReset: () => void;
}

export default function Step4Success({
  fromAccount, toRecipient, amount, transferMode, fee, onReset
}: Step4SuccessProps) {

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  };

  const isRecipientAccount = toRecipient && 'balance' in toRecipient;
  const transactionId = `TXN-${Math.floor(Math.random() * 900000) + 100000}`;
  const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <Card className="w-full flex flex-col items-center border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden py-12 px-6">
      
      <div className="flex flex-col items-center gap-4 text-center max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(76,175,80,0.2)]">
          <CheckCircle2 size={40} />
        </div>
        
        <h2 className="font-headline-lg text-[28px] font-bold text-on-surface">Transfer Successful!</h2>
        <p className="text-[14px] text-on-surface-variant">
          Your funds have been securely transferred via {transferMode}.
        </p>

        {/* Receipt Card */}
        <div className="w-full bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 flex flex-col gap-4 mt-4 shadow-sm text-left">
          
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium">Transaction ID</span>
            <span className="text-[14px] font-mono text-on-surface font-semibold">{transactionId}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-on-surface-variant">Amount Sent</span>
            <span className="text-[18px] font-display-sm font-bold text-tertiary">{formatCurrency(amount)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-on-surface-variant">To</span>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-semibold text-on-surface">{toRecipient?.name}</span>
              <span className="text-[12px] text-on-surface-variant font-mono">
                {isRecipientAccount ? (toRecipient as Account).maskedNumber : (toRecipient as Beneficiary).accountNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-on-surface-variant">From</span>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-semibold text-on-surface">{fromAccount?.name}</span>
              <span className="text-[12px] text-on-surface-variant font-mono">{fromAccount?.maskedNumber}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-dashed border-outline-variant/20">
            <span className="text-[13px] text-on-surface-variant">Date & Time</span>
            <span className="text-[13px] font-medium text-on-surface">{timestamp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <Button variant="outline" className="h-[48px] bg-surface border-outline-variant/20 hover:bg-surface-high font-medium flex items-center gap-2">
            <Download size={16} /> Download
          </Button>
          <Button variant="outline" className="h-[48px] bg-surface border-outline-variant/20 hover:bg-surface-high font-medium flex items-center gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button onClick={onReset} className="col-span-2 h-[48px] bg-primary text-on-primary font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow flex items-center gap-2">
            <Plus size={16} /> Make Another Transfer
          </Button>
          <Link href="/" className="col-span-2 h-[48px] flex items-center justify-center gap-2 text-[14px] font-medium text-primary hover:underline">
            <Home size={16} /> Back to Dashboard
          </Link>
        </div>

      </div>
    </Card>
  );
}
