"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, CreditCard, Lock, Unlock, Shield, Globe, Cpu, CheckCircle2 } from "lucide-react";

interface ManageCardsModalProps {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageCardsModal({ accounts, isOpen, onClose }: ManageCardsModalProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [onlineUsage, setOnlineUsage] = useState(true);
  const [contactless, setContactless] = useState(true);
  const [atmCash, setAtmCash] = useState(true);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"controls" | "pin">("controls");
  const [newPin, setNewPin] = useState("");

  if (!isOpen) return null;

  const currentCard = accounts.find(a => a.linkedCard)?.linkedCard || "Visa Platinum •••• 4599";

  const handlePinReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) return;
    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      setNewPin("");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Manage Debit & Credit Cards</h2>
              <p className="text-xs text-on-surface-variant">Real-time security switches & PIN controls</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Card Header Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black p-4 rounded-xl border border-white/10 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-white/60 uppercase tracking-widest font-mono">Linked Card</span>
            <p className="font-semibold text-white text-sm mt-0.5">{currentCard}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isLocked ? 'bg-error/20 text-error' : 'bg-tertiary/20 text-tertiary'}`}>
              {isLocked ? 'Locked' : 'Active'}
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-surface-high/40 p-1 rounded-xl border border-outline-variant/10 text-xs">
          <button
            onClick={() => setActiveTab("controls")}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${activeTab === "controls" ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Security Controls
          </button>
          <button
            onClick={() => setActiveTab("pin")}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${activeTab === "pin" ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Reset Card PIN
          </button>
        </div>

        {activeTab === "controls" ? (
          <div className="flex flex-col gap-3 text-xs">
            {/* Lock/Unlock Toggle */}
            <div className="p-3.5 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isLocked ? <Lock className="text-error" size={18} /> : <Unlock className="text-tertiary" size={18} />}
                <div>
                  <span className="font-semibold text-on-surface text-sm">Lock Card Temporarily</span>
                  <p className="text-[11px] text-on-surface-variant">Instantly block all transactions</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isLocked}
                onChange={() => setIsLocked(!isLocked)}
                className="w-5 h-5 accent-error cursor-pointer"
              />
            </div>

            {/* Online Transactions */}
            <div className="p-3.5 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Globe className="text-primary" size={18} />
                <div>
                  <span className="font-semibold text-on-surface text-sm">Online / E-Commerce Transactions</span>
                  <p className="text-[11px] text-on-surface-variant">Allow web and app purchases</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={onlineUsage}
                onChange={() => setOnlineUsage(!onlineUsage)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            {/* Contactless NFC */}
            <div className="p-3.5 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Cpu className="text-primary" size={18} />
                <div>
                  <span className="font-semibold text-on-surface text-sm">Contactless Tap & Pay</span>
                  <p className="text-[11px] text-on-surface-variant">POS tap payments without PIN</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={contactless}
                onChange={() => setContactless(!contactless)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            {/* ATM Withdrawal */}
            <div className="p-3.5 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Shield className="text-primary" size={18} />
                <div>
                  <span className="font-semibold text-on-surface text-sm">ATM Cash Withdrawals</span>
                  <p className="text-[11px] text-on-surface-variant">Allow physical cash at ATMs</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={atmCash}
                onChange={() => setAtmCash(!atmCash)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handlePinReset} className="flex flex-col gap-4 text-xs">
            {pinSuccess && (
              <div className="p-3.5 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3 text-tertiary text-xs font-medium">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Card PIN updated successfully!</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Enter New 4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <button
              type="submit"
              disabled={newPin.length !== 4}
              className="w-full py-3 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all disabled:opacity-50 mt-2"
            >
              Update Card PIN
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/20">
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
