"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, FileText, Building2, Monitor, CreditCard, ShoppingBag, Plane, Coffee, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Transaction, Account } from '../../types';
import { MockApi } from '../../lib/mockApi';
import { useAccounts } from '../../context/AccountContext';
import PayBillsModal from '../modals/PayBillsModal';
import MerchantDetailModal from '../modals/MerchantDetailModal';
import { AccountStatementBuilder } from '../../lib/pdf/documents/AccountStatement';

interface MerchantSummary {
  name: string;
  category: string;
  amount: number;
}

interface TransactionsRightSidebarProps {
  onFilterByMerchant?: (merchantName: string) => void;
}

export default function TransactionsRightSidebar({ onFilterByMerchant }: TransactionsRightSidebarProps) {
  const { accounts, payBill } = useAccounts();
  const [topMerchants, setTopMerchants] = useState<MerchantSummary[]>([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState({ name: "", category: "", amount: 0 });
  const [selectedMerchant, setSelectedMerchant] = useState<{ name: string; category: string } | null>(null);

  const [downloadingFormat, setDownloadingFormat] = useState<"pdf" | "csv" | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const upcomingPayments = [
    { id: 1, name: "HDFC Credit Card", category: "Credit Card Bill", dueDate: "Tomorrow", urgency: "high", amount: 12450, icon: <CreditCard size={16} /> },
    { id: 2, name: "Airtel Broadband", category: "Internet & WiFi", dueDate: "In 3 Days", urgency: "medium", amount: 1299, icon: <Monitor size={16} /> },
    { id: 3, name: "Home Loan EMI", category: "Loan EMI Payout", dueDate: "15 May", urgency: "normal", amount: 24500, icon: <Building2 size={16} /> },
  ];

  useEffect(() => {
    const fetchTopMerchants = async () => {
      const txs = await MockApi.getTransactions("ALL");
      const debits = txs.filter(t => t.type === 'DEBIT');
      
      const map: Record<string, { category: string; amount: number }> = {};
      debits.forEach(t => {
        if (!map[t.merchantName]) {
          map[t.merchantName] = { category: t.category, amount: 0 };
        }
        map[t.merchantName].amount += Math.abs(t.amount);
      });

      const sorted = Object.entries(map)
        .map(([name, data]) => ({ name, category: data.category, amount: data.amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      setTopMerchants(sorted.length > 0 ? sorted : [
        { name: "Amazon.in", category: "Shopping", amount: 14500 },
        { name: "MakeMyTrip", category: "Travel", amount: 12000 },
        { name: "Zomato", category: "Food", amount: 4500 }
      ]);
    };
    fetchTopMerchants();
  }, []);

  const totalMerchantSpend = topMerchants.reduce((sum, m) => sum + m.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  const handlePayNow = (payment: { name: string; category: string; amount: number }) => {
    setSelectedBiller(payment);
    setIsPayModalOpen(true);
  };

  const handleDownloadPdf = async () => {
    setDownloadingFormat("pdf");
    setTimeout(async () => {
      const txs = await MockApi.getTransactions("ALL");
      
      // Get the default account for the statement or mock one if undefined
      const account = accounts.length > 0 ? accounts[0] : {
        id: 'ALL',
        type: 'SAVINGS',
        name: 'All Accounts',
        accountNumber: 'N/A',
        maskedNumber: 'N/A',
        lastFour: 'N/A',
        balance: 0,
        currency: 'INR',
        status: 'ACTIVE',
        accountHolder: 'Soumya Ranjan'
      } as Account;

      AccountStatementBuilder.generate(account, "FinEdge Customer", txs, "Complete History");

      setDownloadingFormat(null);
      setDownloadSuccess("PDF Statement downloaded successfully!");
      setTimeout(() => setDownloadSuccess(null), 3000);
    }, 1000);
  };

  const handleDownloadCsv = async () => {
    setDownloadingFormat("csv");
    setTimeout(async () => {
      const txs = await MockApi.getTransactions("ALL");
      const headers = "Transaction ID,Date,Merchant,Category,Type,Amount (INR),Status\n";
      const rows = txs.map(t => `"${t.id}","${t.date}","${t.merchantName}","${t.category}","${t.type}",${t.amount},"${t.status || 'SUCCESS'}"`).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FinEdge_Transactions_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadingFormat(null);
      setDownloadSuccess("Excel (CSV) statement downloaded successfully!");
      setTimeout(() => setDownloadSuccess(null), 3000);
    }, 1000);
  };

  const getMerchantIcon = (category: string) => {
    if (category === 'Shopping') return <ShoppingBag size={16} className="text-secondary" />;
    if (category === 'Travel') return <Plane size={16} className="text-primary-fixed" />;
    if (category === 'Food') return <Coffee size={16} className="text-tertiary" />;
    return <FileText size={16} className="text-on-surface-variant" />;
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
        
        {/* Top Merchants */}
        <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md font-semibold text-on-surface">Top Merchants</h3>
            <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">This Month</span>
          </div>

          <div className="flex flex-col gap-3">
            {topMerchants.map((merchant, idx) => {
              const percentage = totalMerchantSpend > 0 ? (merchant.amount / totalMerchantSpend) * 100 : 0;
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedMerchant({ name: merchant.name, category: merchant.category })}
                  className="flex flex-col gap-2 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/10 cursor-pointer hover:border-primary/40 hover:bg-surface-high/60 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant/10 text-on-surface-variant group-hover:scale-110 transition-transform">
                        {getMerchantIcon(merchant.category)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] text-on-surface font-semibold group-hover:text-primary transition-colors truncate w-[110px]">{merchant.name}</span>
                        <span className="text-[11px] text-on-surface-variant">{merchant.category}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[13px] font-bold text-on-surface">{formatCurrency(merchant.amount)}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">{percentage.toFixed(0)}% spend</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-secondary' : 'bg-tertiary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Payments */}
        <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <h3 className="font-title-md font-semibold text-on-surface">Upcoming Payments</h3>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">3 Pending</span>
          </div>

          <div className="flex flex-col gap-3">
            {upcomingPayments.map(payment => (
              <div 
                key={payment.id} 
                className="flex items-center justify-between bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/10 hover:border-outline-variant/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                    {payment.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] text-on-surface font-semibold truncate w-[110px]">{payment.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        payment.urgency === 'high' 
                          ? 'bg-error/10 text-error border border-error/20 animate-pulse' 
                          : 'bg-secondary/10 text-secondary border border-secondary/20'
                      }`}>
                        {payment.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[13px] font-bold text-on-surface">{formatCurrency(payment.amount)}</span>
                  <button 
                    onClick={() => handlePayNow(payment)}
                    className="text-[11px] bg-primary text-on-primary px-3 py-1 rounded-lg font-bold hover:shadow-[0_0_12px_rgba(240,180,41,0.4)] transition-all flex items-center gap-1"
                  >
                    Pay Now <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Download Reports */}
        <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
          <h3 className="font-title-md font-semibold text-on-surface">Download Reports</h3>

          {downloadSuccess && (
            <div className="p-2.5 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-2 text-tertiary text-xs font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleDownloadPdf}
              disabled={downloadingFormat === "pdf"}
              variant="outline" 
              className="h-16 flex flex-col gap-1.5 items-center justify-center bg-surface border-outline-variant/20 hover:bg-surface-high hover:border-primary/50 transition-colors text-on-surface rounded-xl"
            >
              {downloadingFormat === "pdf" ? (
                <Loader2 size={20} className="animate-spin text-primary" />
              ) : (
                <FileText size={20} className="text-error" />
              )}
              <span className="text-[11px] font-semibold">PDF Statement</span>
            </Button>

            <Button 
              onClick={handleDownloadCsv}
              disabled={downloadingFormat === "csv"}
              variant="outline" 
              className="h-16 flex flex-col gap-1.5 items-center justify-center bg-surface border-outline-variant/20 hover:bg-surface-high hover:border-tertiary/50 transition-colors text-on-surface rounded-xl"
            >
              {downloadingFormat === "csv" ? (
                <Loader2 size={20} className="animate-spin text-tertiary" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
              )}
              <span className="text-[11px] font-semibold">Excel (CSV)</span>
            </Button>
          </div>
        </Card>

      </div>

      <PayBillsModal
        accounts={accounts}
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onPayBill={payBill}
      />

      <MerchantDetailModal
        merchantName={selectedMerchant?.name || null}
        category={selectedMerchant?.category || "Shopping"}
        isOpen={!!selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        onFilterByMerchant={onFilterByMerchant}
      />
    </>
  );
}
