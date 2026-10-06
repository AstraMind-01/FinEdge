"use client";

import React, { useState } from 'react';
import { ShoppingBag, Briefcase, Utensils, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAccounts } from '../context/AccountContext';
import { Skeleton } from './ui/skeleton';
import TransactionDetailModal from './modals/TransactionDetailModal';
import ViewAllTransactionsModal from './modals/ViewAllTransactionsModal';
import { Transaction } from '../types';

export default function RecentTransactions() {
  const { transactions, isLoading, selectedAccountId, accounts } = useAccounts();
  const account = accounts.find(a => a.id === selectedAccountId);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  const getIcon = (category: string, type: string) => {
    if (category === 'Shopping') return <ShoppingBag className="text-secondary" size={18} />;
    if (category === 'Food') return <Utensils className="text-on-surface-variant" size={18} />;
    if (category === 'Transfer' && type === 'CREDIT') return <ArrowDownLeft className="text-tertiary" size={18} />;
    if (category === 'Transfer' && type === 'DEBIT') return <ArrowUpRight className="text-error" size={18} />;
    if (category === 'Salary') return <Briefcase className="text-tertiary" size={18} />;
    return <User className="text-primary" size={18} />;
  };

  const getIconBg = (category: string, type: string) => {
    if (category === 'Shopping') return 'bg-secondary/10';
    if (category === 'Food') return 'bg-surface-highest';
    if (category === 'Transfer' && type === 'CREDIT') return 'bg-tertiary/10';
    if (category === 'Transfer' && type === 'DEBIT') return 'bg-error/10';
    if (category === 'Salary') return 'bg-tertiary/10';
    return 'bg-primary/10';
  };

  return (
    <>
      <div className="lg:col-span-5 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-title-md text-[16px] font-semibold text-on-surface truncate">
            Recent Transactions {account && <span className="text-on-surface-variant text-[14px] font-normal">({account.name})</span>}
          </h3>
          <button 
            onClick={() => setIsViewAllOpen(true)}
            className="text-[12px] text-primary hover:underline font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
          {isLoading ? (
            <>
              <Skeleton className="h-[48px] w-full rounded-lg" />
              <Skeleton className="h-[48px] w-full rounded-lg" />
              <Skeleton className="h-[48px] w-full rounded-lg" />
            </>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-on-surface-variant text-sm py-8">
              No recent transactions found for this account.
            </div>
          ) : (
            transactions.map(tx => (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)}
                className="grid grid-cols-[40px_1fr_auto] items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-surface-high transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(tx.category, tx.type)}`}>
                  {getIcon(tx.category, tx.type)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[13px] font-medium text-on-surface group-hover:text-primary transition-colors truncate">{tx.merchantName}</span>
                  <span className="text-[11px] text-on-surface-variant truncate mt-0.5">{tx.date}</span>
                </div>
                <span className={`font-mono text-[13px] font-medium text-right shrink-0 whitespace-nowrap ${tx.type === 'CREDIT' ? 'text-tertiary' : 'text-error'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <TransactionDetailModal
        transaction={selectedTx}
        account={account || null}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      <ViewAllTransactionsModal
        transactions={transactions}
        account={account || null}
        isOpen={isViewAllOpen}
        onClose={() => setIsViewAllOpen(false)}
        onSelectTransaction={(tx) => {
          setIsViewAllOpen(false);
          setSelectedTx(tx);
        }}
      />
    </>
  );
}
