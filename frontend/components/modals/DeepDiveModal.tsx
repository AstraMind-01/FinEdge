"use client";

import React from "react";
import { X, Receipt, TrendingUp, Landmark, CreditCard, Download, FileText, CheckCircle2 } from "lucide-react";
import { generateAndDownloadCentralPDF } from "../../lib/pdfService";
import { useAccounts } from "../../context/AccountContext";

export interface DeepDiveReportType {
  title: string;
  desc: string;
  category: "TAX" | "INVESTMENT" | "LOAN" | "CREDIT";
}

interface DeepDiveModalProps {
  report: DeepDiveReportType | null;
  onClose: () => void;
}

export default function DeepDiveModal({ report, onClose }: DeepDiveModalProps) {
  const { transactions, accounts } = useAccounts();

  if (!report) return null;

  const sumTransactions = (matcher: (value: string) => boolean) => transactions
    .filter(transaction => matcher(`${transaction.category || ''} ${transaction.merchantName || ''}`))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const creditedIncome = transactions
    .filter(transaction => transaction.type === 'CREDIT')
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const investmentActivity = sumTransactions(category => /invest/i.test(category));
  const loanActivity = sumTransactions(category => /loan|emi/i.test(category));
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const reportTransactions = report.category === 'INVESTMENT'
    ? transactions.filter(transaction => /invest/i.test(`${transaction.category || ''} ${transaction.merchantName || ''}`))
    : report.category === 'LOAN'
      ? transactions.filter(transaction => /loan|emi/i.test(`${transaction.category || ''} ${transaction.merchantName || ''}`))
      : transactions;

  const handleDownloadPDF = () => {
    switch (report.category) {
      case "TAX":
        generateAndDownloadCentralPDF({ documentType: 'MONTHLY_SUMMARY', period: 'Tax transaction activity', account: accounts[0], transactions: reportTransactions });
        break;
      case "INVESTMENT":
        generateAndDownloadCentralPDF({ documentType: 'MONTHLY_SUMMARY', period: 'Investment activity', account: accounts[0], transactions: reportTransactions });
        break;
      case "LOAN":
        generateAndDownloadCentralPDF({ documentType: 'MONTHLY_SUMMARY', period: 'Loan payment activity', account: accounts[0], transactions: reportTransactions });
        break;
      case "CREDIT":
      default:
        generateAndDownloadCentralPDF({ documentType: 'MONTHLY_SUMMARY', period: 'Account and transaction activity', account: accounts[0], transactions: reportTransactions });
        break;
    }
  };

  const getIcon = () => {
    switch (report.category) {
      case "TAX": return <Receipt className="text-error" size={24} />;
      case "INVESTMENT": return <TrendingUp className="text-tertiary" size={24} />;
      case "LOAN": return <Landmark className="text-secondary" size={24} />;
      case "CREDIT": return <CreditCard className="text-primary" size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-[18px] font-headline-lg font-bold text-on-surface">{report.title}</h2>
              <p className="text-[12px] text-on-surface-variant">{report.desc}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {report.category === "TAX" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Assessment Year:</span>
                  <span className="font-semibold text-on-surface">Current synchronized records</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Total Taxable Income:</span>
                  <span className="font-semibold text-on-surface">₹{creditedIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Investment Activity:</span>
                  <span className="font-semibold text-tertiary">₹{investmentActivity.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Transactions Reviewed:</span>
                  <span className="font-semibold text-on-surface">{transactions.length}</span>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                This view is calculated from your synchronized FinEdge transactions. Confirm final tax figures against official tax records before filing.
              </p>
            </div>
          )}

          {report.category === "INVESTMENT" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/10">
                  <span className="text-[11px] text-on-surface-variant uppercase">Portfolio Value</span>
                  <p className="text-[18px] font-bold text-on-surface mt-1">₹{investmentActivity.toLocaleString('en-IN')}</p>
                  <span className="text-[12px] text-tertiary font-medium">Recorded investment activity</span>
                </div>
                <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/10">
                  <span className="text-[11px] text-on-surface-variant uppercase">Active SIPs</span>
                  <p className="text-[18px] font-bold text-on-surface mt-1">{reportTransactions.length}</p>
                  <span className="text-[12px] text-primary font-medium">Matched transactions</span>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Investment totals are derived from transactions categorized as investments across your connected accounts.
              </p>
            </div>
          )}

          {report.category === "LOAN" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Recorded Loan/EMI Activity:</span>
                  <span className="font-semibold text-on-surface">₹{loanActivity.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Matched Payments:</span>
                  <span className="font-semibold text-primary">{reportTransactions.length}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Connected Accounts:</span>
                  <span className="font-semibold text-on-surface">{accounts.length}</span>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Loan details shown here are limited to payments found in the synchronized transaction history.
              </p>
            </div>
          )}

          {report.category === "CREDIT" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[12px] text-on-surface-variant uppercase font-medium">Combined Account Balance</span>
                  <p className="text-[32px] font-bold text-primary leading-none mt-1">₹{totalBalance.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <span className="text-[12px] text-tertiary font-medium">{accounts.length} connected accounts</span>
                  <p className="text-[11px] text-on-surface-variant/70 mt-1">Live FinEdge account data</p>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                A verified bureau credit score is not available from the connected banking services. This view shows synchronized account health instead.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surface-container-low flex justify-between items-center">
          <div className="flex items-center gap-2 text-[12px] text-tertiary">
            <CheckCircle2 size={16} />
            <span>Synchronized FinEdge Record</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-primary text-on-primary font-semibold text-[13px] rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Download size={15} />
            <span>Download Statement PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
