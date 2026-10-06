"use client";

import React from "react";
import { TrendingUp, X, ShieldCheck } from "lucide-react";
import { Holding, SIP } from "../../types";

interface BuyRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHolding: Holding | null;
  modalActionType: 'BUY' | 'REDEEM';
  actionAmount: string;
  setActionAmount: (val: string) => void;
  onConfirm: (e: React.FormEvent) => void;
}

export function BuyRedeemModal({
  isOpen,
  onClose,
  selectedHolding,
  modalActionType,
  actionAmount,
  setActionAmount,
  onConfirm
}: BuyRedeemModalProps) {
  if (!isOpen || !selectedHolding) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={20} className="text-primary" />
            <h3 className="text-base font-bold text-on-surface">{modalActionType === 'BUY' ? 'Buy Additional Units' : 'Redeem Units'}</h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirm} className="space-y-4 text-xs">
          <div className="p-3.5 bg-surface rounded-xl border border-white/5">
            <p className="text-xs font-bold text-on-surface">{selectedHolding.name}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Current Value: ₹{selectedHolding.currentValue.toLocaleString('en-IN')}</p>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">{modalActionType === 'BUY' ? 'Purchase Amount (₹)' : 'Redemption Amount (₹)'}</label>
            <input 
              type="number"
              value={actionAmount}
              onChange={e => setActionAmount(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]">
              {modalActionType === 'BUY' ? 'Confirm Buy' : 'Confirm Redeem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditSipModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSip: SIP | null;
  sipAmountInput: string;
  setSipAmountInput: (val: string) => void;
  selectedDebitDate: number;
  setSelectedDebitDate: (val: number) => void;
  stepUpEnabled: boolean;
  setStepUpEnabled: (val: boolean) => void;
  onConfirm: (e: React.FormEvent) => void;
  onSkipNext: () => void;
  onToggleStatus: (id: string) => void;
}

export function EditSipModal({
  isOpen,
  onClose,
  selectedSip,
  sipAmountInput,
  setSipAmountInput,
  selectedDebitDate,
  setSelectedDebitDate,
  stepUpEnabled,
  setStepUpEnabled,
  onConfirm,
  onSkipNext,
  onToggleStatus
}: EditSipModalProps) {
  if (!isOpen || !selectedSip) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto">
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/30">
                {selectedSip.category || 'Large Cap Equity'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                5★ Rated Fund
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                {selectedSip.riskGrade || 'Very High Risk'}
              </span>
            </div>
            <h3 className="text-base font-bold text-on-surface">{selectedSip.fundName}</h3>
            <p className="text-[11px] text-on-surface-variant">{selectedSip.fundHouse || 'Axis Mutual Fund'} • Folio: {selectedSip.folioNumber || 'FOL-992184-AX'}</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-surface rounded-xl border border-white/5 text-center">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Current NAV</span>
            <span className="text-sm font-bold text-on-surface font-mono">₹{selectedSip.nav || 54.80}</span>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">3Y CAGR Return</span>
            <span className="text-sm font-bold text-green-400 font-mono">+{selectedSip.returns3Y || 18.4}% p.a.</span>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Installments</span>
            <span className="text-sm font-bold text-primary font-mono">{selectedSip.installmentsPaid || 12} Paid</span>
          </div>
        </div>

        <div className="p-3.5 mb-4 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-on-surface-variant uppercase font-semibold">Wealth Projection (at 15% CAGR)</p>
            <p className="text-xs text-on-surface mt-0.5">
              Investing <strong className="text-primary">₹{Number(sipAmountInput || 5000).toLocaleString('en-IN')}/mo</strong> grows to:
            </p>
          </div>
          <div className="text-right font-mono">
            <p className="text-xs font-bold text-primary">5Y: ~₹{Math.round(Number(sipAmountInput || 5000) * 89.6).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-tertiary font-bold">10Y: ~₹{Math.round(Number(sipAmountInput || 5000) * 278.6).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <form onSubmit={onConfirm} className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-on-surface-variant">Monthly SIP Contribution (₹)</label>
              <span className="text-[11px] text-on-surface-variant font-mono">Min ₹500</span>
            </div>
            <input 
              type="number"
              value={sipAmountInput}
              onChange={e => setSipAmountInput(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">Monthly Auto-Debit Date</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 25].map(d => (
                <button 
                  key={d} 
                  type="button"
                  onClick={() => setSelectedDebitDate(d)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${selectedDebitDate === d ? 'bg-primary text-on-primary border-primary shadow-md' : 'bg-surface border-white/10 text-on-surface-variant hover:text-on-surface'}`}
                >
                  {d}th of month
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="font-bold text-on-surface text-xs">Annual Step-Up SIP (+10%)</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Auto-increase SIP amount by 10% every year to fight inflation.</p>
            </div>
            <input 
              type="checkbox"
              checked={stepUpEnabled}
              onChange={e => setStepUpEnabled(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer shrink-0 ml-3"
            />
          </div>

          <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
            <ShieldCheck size={16} className="text-tertiary shrink-0" />
            <span>Linked Auto-Debit Account: <strong>{selectedSip.linkedAccount || 'Primary Savings ACC-001 •••• 8812'}</strong></span>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={onSkipNext}
              className="py-2.5 px-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest text-xs border border-white/10"
            >
              Skip Next
            </button>
            <button 
              type="button"
              onClick={() => onToggleStatus(selectedSip.id)}
              className="py-2.5 px-3 bg-surface-high text-amber-400 font-semibold rounded-xl hover:bg-surface-highest text-xs border border-amber-500/20"
            >
              {selectedSip.status === 'PAUSED' ? 'Resume' : 'Pause'}
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] text-xs"
            >
              Save &amp; Update Mandate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  setGoalTitle: (val: string) => void;
  goalTarget: string;
  setGoalTarget: (val: string) => void;
  onConfirm: (e: React.FormEvent) => void;
}

export function NewGoalModal({
  isOpen,
  onClose,
  goalTitle,
  setGoalTitle,
  goalTarget,
  setGoalTarget,
  onConfirm
}: NewGoalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-on-surface">Create Financial Goal</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirm} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">Goal Name</label>
            <input 
              type="text"
              placeholder="e.g. Dream House, Retirement"
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
              required
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">Target Amount (₹)</label>
            <input 
              type="number"
              value={goalTarget}
              onChange={e => setGoalTarget(e.target.value)}
              required
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]">Create Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
