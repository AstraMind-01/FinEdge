import React, { useState } from 'react';
import { Loan } from '../../types';
import { Home, User, Car, GraduationCap, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
}

const loanIcons: Record<string, { icon: React.ReactNode; bg: string }> = {
  HOME: { icon: <Home size={22} />, bg: "bg-blue-500/15 text-blue-400" },
  PERSONAL: { icon: <User size={22} />, bg: "bg-purple-500/15 text-purple-400" },
  CAR: { icon: <Car size={22} />, bg: "bg-teal-500/15 text-teal-400" },
  EDUCATION: { icon: <GraduationCap size={22} />, bg: "bg-primary/15 text-primary" },
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  CLOSED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function LoanCard({ loan }: LoanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const repaymentPercent = Math.round((loan.emiPaid / loan.totalTenure) * 100);
  const { icon, bg } = loanIcons[loan.type] || loanIcons.PERSONAL;

  return (
    <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
      {/* Main Row */}
      <div className="p-6 flex flex-col lg:flex-row gap-6">
        {/* Left: Icon, Name, Status */}
        <div className="flex items-start gap-4 lg:w-[240px] shrink-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-on-surface font-bold text-sm truncate">{loan.name}</h3>
            <p className="text-on-surface-variant text-[11px] mt-1">{loan.accountNumber}</p>
            <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[loan.status]}`}>
              {loan.status === 'OVERDUE' && <AlertTriangle size={10} />}
              {loan.status}
              {loan.overdueCount ? ` (${loan.overdueCount} EMIs)` : ''}
            </span>
          </div>
        </div>

        {/* Center: Amounts + Progress */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-on-surface-variant text-[11px] uppercase tracking-wider mb-1">Loan Amount</p>
            <p className="text-on-surface font-medium text-sm">₹{loan.originalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[11px] uppercase tracking-wider mb-1">Outstanding</p>
            <p className="text-on-surface font-bold text-lg">₹{loan.outstandingBalance.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[11px] uppercase tracking-wider mb-1">Interest Rate</p>
            <p className="text-on-surface font-medium text-sm">{loan.interestRate}% p.a.</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[11px] uppercase tracking-wider mb-1">Tenure</p>
            <p className="text-on-surface font-medium text-sm">{loan.emiPaid} of {loan.totalTenure} months</p>
          </div>
        </div>

        {/* Right: EMI + Actions */}
        <div className="flex flex-col items-end gap-3 lg:w-[200px] shrink-0">
          <div className="text-right">
            <p className="text-on-surface-variant text-[11px] uppercase tracking-wider mb-1">Next EMI</p>
            <p className="text-on-surface font-bold">₹{loan.nextEmiAmount.toLocaleString('en-IN')}</p>
            <p className="text-on-surface-variant text-[11px] mt-0.5">{loan.nextEmiDate}</p>
          </div>
          <button className="bg-primary text-on-primary text-sm font-medium px-5 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all w-full lg:w-auto">
            Pay EMI Now
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-4">
        <div className="flex justify-between text-[11px] text-on-surface-variant mb-1.5">
          <span>Repayment Progress</span>
          <span className="font-medium text-on-surface">{repaymentPercent}%</span>
        </div>
        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              loan.status === 'OVERDUE' ? 'bg-red-500' : 
              repaymentPercent > 80 ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${repaymentPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3 border-t border-white/5 text-on-surface-variant hover:text-on-surface text-[12px] font-medium transition-colors hover:bg-surface-container/50"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide Details' : 'View EMI Schedule & Details'}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-fade-in">
          <div className="flex gap-6 flex-wrap text-sm mb-6">
            <div>
              <span className="text-on-surface-variant text-[11px] uppercase tracking-wider">Disbursement Date</span>
              <p className="text-on-surface font-medium mt-1">{loan.disbursementDate}</p>
            </div>
            <div>
              <span className="text-on-surface-variant text-[11px] uppercase tracking-wider">Monthly EMI</span>
              <p className="text-on-surface font-medium mt-1">₹{loan.monthlyEmi.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-on-surface-variant text-[11px] uppercase tracking-wider">Interest Paid (YTD)</span>
              <p className="text-on-surface font-medium mt-1">₹{loan.interestPaidThisYear.toLocaleString('en-IN')}</p>
            </div>
            <div className="ml-auto">
              <button className="text-primary text-sm hover:underline font-medium">Make Prepayment →</button>
            </div>
          </div>

          {/* EMI Schedule Table */}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Month</th>
                  <th className="text-left px-4 py-3 font-medium">Due Date</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-right px-4 py-3 font-medium">Principal</th>
                  <th className="text-right px-4 py-3 font-medium">Interest</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.emiSchedule.map((emi, i) => (
                  <tr key={i} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container/30'}`}>
                    <td className="px-4 py-3 text-on-surface">{emi.month}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{emi.dueDate}</td>
                    <td className="px-4 py-3 text-on-surface text-right font-medium">₹{emi.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-right">₹{emi.principal.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-right">₹{emi.interest.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        emi.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        emi.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {emi.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
