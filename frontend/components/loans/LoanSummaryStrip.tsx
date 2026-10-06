import React from 'react';
import { Loan } from '../../types';
import { Wallet, FileCheck2, CalendarClock, TrendingDown } from 'lucide-react';

interface LoanSummaryStripProps {
  loans: Loan[];
}

export default function LoanSummaryStrip({ loans }: LoanSummaryStripProps) {
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const activeLoans = loans.filter(l => l.status !== 'CLOSED').length;
  const totalInterestThisYear = loans.reduce((sum, l) => sum + l.interestPaidThisYear, 0);

  // Find next EMI due across all loans
  const activeWithEmi = loans.filter(l => l.status !== 'CLOSED');
  const nextEmi = activeWithEmi.length > 0
    ? activeWithEmi.reduce((nearest, l) =>
        !nearest || new Date(l.nextEmiDate) < new Date(nearest.nextEmiDate) ? l : nearest
      , null as Loan | null)
    : null;

  const cards = [
    {
      title: "Total Outstanding",
      value: `₹${totalOutstanding.toLocaleString('en-IN')}`,
      icon: <Wallet size={20} />,
      iconBg: "bg-blue-500/10 text-blue-400"
    },
    {
      title: "Active Loans",
      value: activeLoans.toString(),
      icon: <FileCheck2 size={20} />,
      iconBg: "bg-green-500/10 text-green-400"
    },
    {
      title: "Next EMI Due",
      value: nextEmi ? `₹${nextEmi.nextEmiAmount.toLocaleString('en-IN')}` : "—",
      subtitle: nextEmi ? nextEmi.nextEmiDate : undefined,
      icon: <CalendarClock size={20} />,
      iconBg: "bg-amber-500/10 text-amber-400"
    },
    {
      title: "Interest Paid (YTD)",
      value: `₹${totalInterestThisYear.toLocaleString('en-IN')}`,
      icon: <TrendingDown size={20} />,
      iconBg: "bg-purple-500/10 text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <div key={i} className="bg-surface-container-low rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
            {card.icon}
          </div>
          <div className="min-w-0">
            <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1 truncate">{card.title}</p>
            <p className="text-on-surface font-bold text-lg truncate">{card.value}</p>
            {card.subtitle && (
              <p className="text-on-surface-variant text-[11px] mt-0.5">{card.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
