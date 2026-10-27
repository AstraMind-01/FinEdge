"use client";

import React from "react";
import { Transaction, Account } from "../../types";
import { Landmark, ArrowUpRight, ArrowDownLeft, ShoppingBag, Utensils, Briefcase } from "lucide-react";

interface Props {
  query: string;
  accounts: Account[];
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (id: string) => void;
}

export default function GlobalSearchDropdown({ query, accounts, transactions, isOpen, onClose, onSelectAccount }: Props) {
  if (!isOpen || !query.trim()) return null;

  const matchedAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase()) || 
    a.maskedNumber.includes(query) ||
    a.type.toLowerCase().includes(query.toLowerCase())
  );

  const matchedTxns = transactions.filter(t => 
    t.merchantName.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase()) ||
    t.id.toLowerCase().includes(query.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  return (
    <div className="absolute left-0 top-12 w-[320px] sm:w-[400px] bg-surface-container border border-outline-variant/20 rounded-2xl shadow-2xl z-50 text-on-surface p-4 flex flex-col gap-3 max-h-[380px] overflow-y-auto animate-in fade-in duration-150">
      {matchedAccounts.length === 0 && matchedTxns.length === 0 ? (
        <div className="p-6 text-center text-xs text-on-surface-variant">
          No accounts or transactions found for "{query}".
        </div>
      ) : (
        <>
          {matchedAccounts.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Matching Accounts ({matchedAccounts.length})</span>
              {matchedAccounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => { onSelectAccount(acc.id); onClose(); }}
                  className="p-2.5 bg-surface-high/40 hover:bg-surface-high rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-primary" />
                    <span className="font-semibold text-on-surface">{acc.name}</span>
                  </div>
                  <span className="font-mono text-on-surface-variant text-[11px]">{acc.maskedNumber}</span>
                </div>
              ))}
            </div>
          )}

          {matchedTxns.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Matching Transactions ({matchedTxns.length})</span>
              {matchedTxns.map(tx => (
                <div
                  key={tx.id}
                  className="p-2.5 bg-surface-high/40 hover:bg-surface-high rounded-xl transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">{tx.merchantName}</span>
                    <span className="text-[10px] text-on-surface-variant">{tx.date} • {tx.category}</span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${tx.type === 'CREDIT' ? 'text-tertiary' : 'text-on-surface'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
