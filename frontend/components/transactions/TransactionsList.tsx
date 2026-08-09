"use client";
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ShoppingBag, Coffee, Plane, Receipt, ArrowLeftRight, Briefcase, Plus, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Transaction } from '../../types';
import { MockApi } from '../../lib/mockApi';

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await MockApi.getTransactions("ALL");
        // Sort by timestamp descending
        const sorted = data.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
          return 0;
        });
        setTransactions(sorted);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(prev => prev === id ? null : id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Shopping': return <ShoppingBag size={20} className="text-secondary" />;
      case 'Food': return <Coffee size={20} className="text-tertiary" />;
      case 'Travel': return <Plane size={20} className="text-primary-fixed" />;
      case 'Bills': return <Receipt size={20} className="text-error" />;
      case 'Transfer': return <ArrowLeftRight size={20} className="text-primary" />;
      case 'Salary': return <Briefcase size={20} className="text-tertiary" />;
      case 'Investment': return <TrendingUp size={20} className="text-primary-fixed" />;
      default: return <Plus size={20} className="text-on-surface-variant" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Shopping': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'Food': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'Travel': return 'bg-primary-fixed/10 text-primary-fixed border-primary-fixed/20';
      case 'Bills': return 'bg-error/10 text-error border-error/20';
      case 'Transfer': return 'bg-primary/10 text-primary border-primary/20';
      case 'Salary': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'Investment': return 'bg-primary-fixed/10 text-primary-fixed border-primary-fixed/20';
      default: return 'bg-surface-container-high text-on-surface-variant border-outline-variant/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Math.abs(amount));
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'SUCCESS') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-tertiary/10 text-tertiary border border-tertiary/20">Success</span>;
    if (status === 'PENDING') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20">Pending</span>;
    if (status === 'FAILED') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-error/10 text-error border border-error/20">Failed</span>;
    return null;
  };

  // Group transactions by date string
  const groupedTransactions: Record<string, Transaction[]> = {};
  const currentTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  currentTransactions.forEach(t => {
    const groupKey = t.date.split(',')[0].trim();
    if (!groupedTransactions[groupKey]) {
      groupedTransactions[groupKey] = [];
    }
    groupedTransactions[groupKey].push(t);
  });

  if (isLoading) {
    return (
      <Card className="w-full flex flex-col p-6 gap-4 border border-outline-variant/10">
        <Skeleton className="h-[60px] w-full rounded-lg" />
        <Skeleton className="h-[60px] w-full rounded-lg" />
        <Skeleton className="h-[60px] w-full rounded-lg" />
        <Skeleton className="h-[60px] w-full rounded-lg" />
      </Card>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden">
      
      {Object.keys(groupedTransactions).map((dateGroup, groupIdx) => (
        <div key={dateGroup} className="flex flex-col">
          <div className="bg-surface-container-low px-5 py-2.5 border-y border-outline-variant/10 first:border-t-0">
            <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">{dateGroup}</span>
          </div>
          <div className="flex flex-col divide-y divide-outline-variant/5">
            {groupedTransactions[dateGroup].map(t => {
              const isExpanded = expandedId === t.id;
              return (
                <div key={t.id} className="flex flex-col">
                  <div 
                    className="p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer group"
                    onClick={(e) => toggleExpand(t.id, e)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${getCategoryColor(t.category)}`}>
                        {getCategoryIcon(t.category)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-title-md text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">{t.merchantName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(t.category)}`}>
                            {t.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                          <span>{t.date}</span>
                          {t.referenceId && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-outline-variant/40"></span>
                              <span className="font-mono tracking-widest">{t.referenceId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-display-sm text-[16px] font-bold tracking-tight ${t.type === 'CREDIT' ? 'text-tertiary' : 'text-on-surface'}`}>
                          {t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant group-hover:bg-surface transition-colors shrink-0">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[150px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-5 py-4 bg-surface-container-low border-t border-outline-variant/5 grid grid-cols-2 sm:grid-cols-4 gap-4 ml-15">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">Transaction ID</span>
                        <span className="text-[12px] text-on-surface font-mono">{t.id}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">Payment Mode</span>
                        <span className="text-[12px] text-on-surface font-medium">{t.paymentMode || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">Account</span>
                        <span className="text-[12px] text-on-surface font-medium">{t.accountId}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">Remarks</span>
                        <span className="text-[12px] text-on-surface font-medium truncate">{t.remarks || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="p-4 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
        <span className="text-[12px] text-on-surface-variant">
          Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} transactions
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1.5 text-[12px] font-medium rounded-md bg-surface border border-outline-variant/20 disabled:opacity-50 hover:bg-surface-high transition-colors"
          >
            Previous
          </button>
          <span className="text-[12px] font-medium text-on-surface">Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1.5 text-[12px] font-medium rounded-md bg-surface border border-outline-variant/20 disabled:opacity-50 hover:bg-surface-high transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
}
