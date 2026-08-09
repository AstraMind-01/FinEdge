"use client";
import React, { useState } from 'react';
import { Send, Receipt, Smartphone, Landmark, CreditCard, FileText, TrendingUp, MoreHorizontal } from 'lucide-react';
import { useAccounts } from '../context/AccountContext';
import QuickTransferModal from './modals/QuickTransferModal';
import PayBillsModal from './modals/PayBillsModal';
import MobileRechargeModal from './modals/MobileRechargeModal';
import FixedDepositsModal from './modals/FixedDepositsModal';
import ManageCardsModal from './modals/ManageCardsModal';
import ApplyLoanModal from './modals/ApplyLoanModal';
import MutualFundsModal from './modals/MutualFundsModal';
import MoreActionsModal from './modals/MoreActionsModal';

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<
    "transfer" | "bills" | "recharge" | "fd" | "cards" | "loan" | "mf" | "more" | null
  >(null);

  const { 
    accounts, 
    selectedAccountId, 
    executeTransfer, 
    payBill, 
    rechargeMobile, 
    createFixedDeposit, 
    investMutualFund 
  } = useAccounts();

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  return (
    <>
      <div className="lg:col-span-4 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col h-full">
        <h3 className="font-title-md text-[16px] font-semibold text-on-surface mb-4 truncate">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-y-6 gap-x-2 w-full flex-1 content-start">
          {/* 1. Fund Transfer */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveModal("transfer")}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <Send className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Fund<br/>Transfer</span>
          </div>

          {/* 2. Pay Bills */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveModal("bills")}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <Receipt className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Pay<br/>Bills</span>
          </div>

          {/* 3. Mobile Recharge */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveModal("recharge")}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <Smartphone className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Mobile<br/>Recharge</span>
          </div>

          {/* 4. Fixed Deposits */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveModal("fd")}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <Landmark className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Fixed<br/>Deposits</span>
          </div>

          {/* 5. Manage Cards */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveModal("cards")}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <CreditCard className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Manage<br/>Cards</span>
          </div>

          {/* 6. Apply Loan */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveModal("loan")}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <FileText className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Apply<br/>Loan</span>
          </div>

          {/* 7. Mutual Funds */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveModal("mf")}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <TrendingUp className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">Mutual<br/>Funds</span>
          </div>

          {/* 8. More Actions */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveModal("more")}>
            <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center group-hover:bg-primary transition-all shadow-sm">
              <MoreHorizontal className="text-on-surface-variant group-hover:text-on-primary transition-colors" size={20} />
            </div>
            <span className="text-[11px] text-center text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">More<br/>Actions</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuickTransferModal
        fromAccount={selectedAccount}
        accounts={accounts}
        isOpen={activeModal === "transfer"}
        onClose={() => setActiveModal(null)}
        onTransfer={executeTransfer}
      />

      <PayBillsModal
        accounts={accounts}
        isOpen={activeModal === "bills"}
        onClose={() => setActiveModal(null)}
        onPayBill={payBill}
      />

      <MobileRechargeModal
        accounts={accounts}
        isOpen={activeModal === "recharge"}
        onClose={() => setActiveModal(null)}
        onRecharge={rechargeMobile}
      />

      <FixedDepositsModal
        accounts={accounts}
        isOpen={activeModal === "fd"}
        onClose={() => setActiveModal(null)}
        onCreateFd={createFixedDeposit}
      />

      <ManageCardsModal
        accounts={accounts}
        isOpen={activeModal === "cards"}
        onClose={() => setActiveModal(null)}
      />

      <ApplyLoanModal
        isOpen={activeModal === "loan"}
        onClose={() => setActiveModal(null)}
      />

      <MutualFundsModal
        accounts={accounts}
        isOpen={activeModal === "mf"}
        onClose={() => setActiveModal(null)}
        onInvest={investMutualFund}
      />

      <MoreActionsModal
        isOpen={activeModal === "more"}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
