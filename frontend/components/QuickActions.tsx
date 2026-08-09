"use client";
import React, { useState } from 'react';
import { Send, Receipt, Smartphone, Landmark, CreditCard, FileText, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Button } from './ui/button';
import { useAccounts } from '../context/AccountContext';

export default function QuickActions() {
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [transferring, setTransferring] = useState(false);
  
  const { accounts, executeTransfer } = useAccounts();

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amount || fromAccount === toAccount) return;
    setTransferring(true);
    try {
      await executeTransfer(fromAccount, toAccount, parseFloat(amount));
      setTransferOpen(false);
      setFromAccount("");
      setToAccount("");
      setAmount("");
    } catch (e) {
      alert("Transfer failed.");
    }
    setTransferring(false);
  };

  return (
    <>
      <div className="lg:col-span-4 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col h-full">
        <h3 className="font-title-md text-[16px] font-semibold text-on-surface mb-4 truncate">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-y-6 gap-x-2 w-full flex-1 content-start">
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setTransferOpen(true)}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <Send className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Fund<br/>Transfer</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <Receipt className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Pay<br/>Bills</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <Smartphone className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Mobile<br/>Recharge</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <Landmark className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Fixed<br/>Deposits</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <CreditCard className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Manage<br/>Cards</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <FileText className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Apply<br/>Loan</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <TrendingUp className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Mutual<br/>Funds</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <MoreHorizontal className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">More<br/>Actions</span>
          </div>
        </div>
      </div>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund Transfer</DialogTitle>
            <DialogDescription>
              Transfer money between your accounts securely.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-on-surface-variant">From Account</label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} ({acc.maskedNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-on-surface-variant">To Account</label>
              <Select value={toAccount} onValueChange={setToAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.id !== fromAccount).map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} ({acc.maskedNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-on-surface-variant">Amount (INR)</label>
              <input 
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex h-9 w-full rounded-md border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleTransfer} disabled={transferring || !fromAccount || !toAccount || !amount}>
              {transferring ? "Processing..." : "Transfer Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
