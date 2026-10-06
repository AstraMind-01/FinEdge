"use client";

import React, { useEffect, useState } from "react";
import { Transaction } from "../../types";
import { X, Store, ArrowUpRight, Calendar, ShoppingBag, Coffee, Plane, Receipt, Briefcase, TrendingUp, CheckCircle2 } from "lucide-react";
import { MockApi } from "../../lib/mockApi";

interface Props {
  merchantName: string | null;
  category: string;
  isOpen: boolean;
  onClose: () => void;
  onFilterByMerchant?: (name: string) => void;
}

export default function MerchantDetailModal({ merchantName, category, isOpen, onClose, onFilterByMerchant }: Props) {
  const [merchantTxList, setMerchantTxList] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !merchantName) return;
    const fetchMerchantData = async () => {
      setIsLoading(true);
      const allTx = await MockApi.getTransactions("ALL");
      const matched = allTx.filter(t => t.merchantName.toLowerCase() === merchantName.toLowerCase());
      setMerchantTxList(matched.length > 0 ? matched : [
        {
          id: `TX-${Date.now()}`,
          accountId: "ACC-001",
          merchantName: merchantName,
          amount: -14500,
          date: "Yesterday, 10:30 AM",
          type: "DEBIT",
          category: (category as any) || "Shopping",
          status: "SUCCESS",
          referenceId: "PAY-91823",
          paymentMode: "Visa Platinum"
        }
      ]);
      setIsLoading(false);
    };
    fetchMerchantData();
  }, [isOpen, merchantName, category]);

  if (!isOpen || !merchantName) return null;

  const totalSpent = merchantTxList.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const avgTx = merchantTxList.length > 0 ? totalSpent / merchantTxList.length : totalSpent;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  const handleFilterClick = () => {
    if (onFilterByMerchant) {
      onFilterByMerchant(merchantName);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Store size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">{merchantName}</h2>
              <span className="text-xs text-on-surface-variant font-medium">Merchant Spend Intelligence</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-surface-high/50 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-1">
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Total Spent</span>
            <span className="text-base font-bold text-error font-mono">{formatCurrency(totalSpent)}</span>
          </div>

          <div className="bg-surface-high/50 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-1">
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Total Orders</span>
            <span className="text-base font-bold text-on-surface font-mono">{merchantTxList.length} Payments</span>
          </div>

          <div className="bg-surface-high/50 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Avg Order Size</span>
            <span className="text-base font-bold text-primary font-mono">{formatCurrency(avgTx)}</span>
          </div>
        </div>

        {/* Transaction History Header */}
        <div className="flex justify-between items-center pt-2">
          <h3 className="font-semibold text-xs text-on-surface uppercase tracking-wider">Transaction History</h3>
          <span className="text-[11px] text-on-surface-variant">Showing all records</span>
        </div>

        {/* History List */}
        <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          {merchantTxList.map(t => (
            <div key={t.id} className="flex items-center justify-between bg-surface-high/40 p-3 rounded-xl border border-outline-variant/10">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-on-surface">{t.merchantName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-tertiary/10 text-tertiary border border-tertiary/20">Success</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                  <span>{t.date}</span>
                  <span>•</span>
                  <span className="font-mono">{t.referenceId || t.id}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-error font-mono">-{formatCurrency(Math.abs(t.amount))}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
          <button
            onClick={handleFilterClick}
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            Filter main list by {merchantName} <ArrowUpRight size={14} />
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
