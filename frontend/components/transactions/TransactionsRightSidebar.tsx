import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Download, FileText, ArrowRight, Building2, Smartphone, Monitor } from 'lucide-react';

export default function TransactionsRightSidebar() {
  const topMerchants = [
    { id: 1, name: "Amazon.in", category: "Shopping", amount: 14500, icon: <ShoppingBagIcon /> },
    { id: 2, name: "MakeMyTrip", category: "Travel", amount: 12000, icon: <PlaneIcon /> },
    { id: 3, name: "Zomato", category: "Food", amount: 4500, icon: <CoffeeIcon /> },
  ];

  const upcomingPayments = [
    { id: 1, name: "HDFC Credit Card", dueDate: "Tomorrow", amount: 12450, icon: <CreditCardIcon /> },
    { id: 2, name: "Airtel Broadband", dueDate: "In 3 Days", amount: 1299, icon: <Monitor /> },
    { id: 3, name: "Home Loan EMI", dueDate: "15 May", amount: 24500, icon: <Building2 /> },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
      
      {/* Top Merchants */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between">
          <h3 className="font-title-md font-semibold text-on-surface">Top Merchants</h3>
          <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">This Month</span>
        </div>
        <div className="flex flex-col gap-3">
          {topMerchants.map((merchant, idx) => (
            <div key={merchant.id} className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg border border-outline-variant/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant/10 text-on-surface-variant">
                  {merchant.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-on-surface font-medium truncate w-[120px]">{merchant.name}</span>
                  <span className="text-[11px] text-on-surface-variant">{merchant.category}</span>
                </div>
              </div>
              <span className="text-[13px] font-bold text-on-surface">{formatCurrency(merchant.amount)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Payments */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <h3 className="font-title-md font-semibold text-on-surface">Upcoming Payments</h3>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {upcomingPayments.map(payment => (
            <div key={payment.id} className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg border border-outline-variant/5 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant/10 text-primary">
                  {payment.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-on-surface font-medium truncate w-[110px]">{payment.name}</span>
                  <span className={`text-[11px] font-medium ${payment.dueDate === 'Tomorrow' ? 'text-error' : 'text-on-surface-variant'}`}>{payment.dueDate}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[13px] font-bold text-on-surface">{formatCurrency(payment.amount)}</span>
                <button className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold hover:bg-primary hover:text-on-primary transition-colors">
                  Pay Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Download Reports */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <h3 className="font-title-md font-semibold text-on-surface">Download Reports</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-16 flex flex-col gap-1.5 items-center justify-center bg-surface border-outline-variant/20 hover:bg-surface-high hover:border-primary/50 transition-colors">
            <FileText size={20} className="text-error" />
            <span className="text-[11px] font-medium">PDF Statement</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-1.5 items-center justify-center bg-surface border-outline-variant/20 hover:bg-surface-high hover:border-tertiary/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
            <span className="text-[11px] font-medium">Excel (CSV)</span>
          </Button>
        </div>
      </Card>

    </div>
  );
}

// Icons for merchants
function ShoppingBagIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
}
function PlaneIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3-1-2 1 5 5 1-2-1-3 3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1Z"/></svg>;
}
function CoffeeIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>;
}
function CreditCardIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
}
