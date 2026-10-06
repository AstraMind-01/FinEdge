"use client";

import React, { useState } from 'react';
import { BankCard, CardControls } from '../../types';
import { Globe, ShoppingBag, Wifi, CreditCard as CreditCardIcon, Landmark, CheckCircle2, ShieldAlert, Sparkles, Lock, KeyRound, X, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

interface CardControlsTabsProps {
  card: BankCard;
  onUpdateControls: (controls: CardControls) => void;
}

export default function CardControlsTabs({ card, onUpdateControls }: CardControlsTabsProps) {
  const [activeTab, setActiveTab] = useState('controls');
  const [controls, setControls] = useState<CardControls>(card.controls);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Security PIN Verification Modal State
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityPin, setSecurityPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync state if card changes
  React.useEffect(() => {
    setControls(card.controls);
    setHasChanges(false);
  }, [card]);

  const handleToggle = (key: keyof CardControls) => {
    setControls((prev: CardControls) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleLimitChange = (key: keyof CardControls, value: number) => {
    setControls((prev: CardControls) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleOpenSecurityModal = () => {
    setPinError(null);
    setSecurityPin("");
    setSecurityModalOpen(true);
  };

  const handleVerifyAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityPin.length < 4) {
      setPinError("Please enter your valid 4-digit Security PIN.");
      return;
    }

    if (securityPin !== "1234") {
      setPinError("Invalid Security PIN. Demo PIN is 1234.");
      return;
    }

    setIsVerifying(true);
    setPinError(null);

    setTimeout(() => {
      setIsVerifying(false);
      setSecurityModalOpen(false);
      onUpdateControls(controls);
      setHasChanges(false);
      setSaveToast(true);
      setTimeout(() => {
        setSaveToast(false);
      }, 3500);
    }, 600);
  };

  const tabs = [
    { id: 'controls', label: 'Card Controls' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'rewards', label: 'Rewards & Offers' },
    ...(card.type === 'CREDIT' ? [{ id: 'emi', label: 'EMI on Card' }] : [])
  ];

  return (
    <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden relative">
      
      {/* Success Toast */}
      {saveToast && (
        <div className="absolute top-3 right-4 z-30 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>Security verified &amp; card controls updated successfully!</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-white/5 bg-surface-container-low">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(240,180,41,0.8)]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="p-6">
        {activeTab === 'controls' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Security Notice Banner */}
            <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-xs text-on-surface">
              <ShieldCheck size={18} className="text-primary shrink-0" />
              <div>
                <span className="font-bold text-primary">2FA Protected Card Settings:</span> Any change to card transaction channels or daily spending limits requires 4-Digit Security PIN authorization.
              </div>
            </div>

            {/* Toggles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ToggleItem 
                icon={<ShoppingBag />} title="Online Transactions" 
                desc="E-commerce and online payments" 
                checked={controls.onlineTransactions} 
                onChange={() => handleToggle('onlineTransactions')} 
              />
              <ToggleItem 
                icon={<Globe />} title="International Usage" 
                desc="Transactions outside your home country" 
                checked={controls.internationalUsage ?? controls.internationalTx} 
                onChange={() => handleToggle('internationalUsage')} 
              />
              <ToggleItem 
                icon={<Wifi />} title="Contactless Payments" 
                desc="Tap to pay at supported terminals" 
                checked={controls.contactlessPayments ?? controls.contactless} 
                onChange={() => handleToggle('contactlessPayments')} 
              />
              <ToggleItem 
                icon={<Landmark />} title="ATM Withdrawals" 
                desc="Cash withdrawals at ATMs" 
                checked={controls.atmWithdrawals} 
                onChange={() => handleToggle('atmWithdrawals')} 
              />
              <ToggleItem 
                icon={<CreditCardIcon />} title="POS Transactions" 
                desc="Swipe or dip at merchant terminals" 
                checked={controls.posTransactions} 
                onChange={() => handleToggle('posTransactions')} 
              />
            </div>

            <div className="h-px bg-white/5"></div>

            {/* Limits */}
            <div>
              <h4 className="text-base font-bold text-on-surface mb-6">Spending Limits (Daily)</h4>
              <div className="space-y-6 max-w-2xl">
                <LimitSlider 
                  title="ATM Withdrawal Limit" 
                  value={controls.dailyAtmLimit ?? controls.atmLimit ?? 0} 
                  max={200000} 
                  step={5000}
                  disabled={!controls.atmWithdrawals}
                  onChange={(val: number) => handleLimitChange('dailyAtmLimit', val)} 
                />
                <LimitSlider 
                  title="POS Transaction Limit" 
                  value={controls.dailyPosLimit ?? 100000} 
                  max={500000} 
                  step={10000}
                  disabled={!controls.posTransactions}
                  onChange={(val: number) => handleLimitChange('dailyPosLimit', val)} 
                />
                <LimitSlider 
                  title="Online Transaction Limit" 
                  value={controls.onlineLimit ?? 150000} 
                  max={500000} 
                  step={10000}
                  disabled={!controls.onlineTransactions}
                  onChange={(val: number) => handleLimitChange('onlineLimit', val)} 
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                <Lock size={14} className="text-tertiary" /> Encrypted setting changes require 4-digit PIN
              </span>
              <button 
                type="button"
                onClick={handleOpenSecurityModal}
                disabled={!hasChanges}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer flex items-center gap-2"
              >
                <KeyRound size={16} /> Authorize &amp; Save Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-sm font-bold text-on-surface mb-2">Recent Card Activity ({card.maskedNumber})</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-on-surface">Amazon.in Online Purchase</h5>
                    <span className="text-[11px] text-on-surface-variant">05 Aug 2026 • Card •••• {card.maskedNumber.slice(-4)}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-error">- ₹4,599.00</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary font-bold">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-on-surface">Cashback Reward Credit</h5>
                    <span className="text-[11px] text-on-surface-variant">28 Jul 2026 • Card Rewards</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-tertiary">+ ₹1,500.00</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-surface-container rounded-2xl border border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Available Reward Points</span>
                <h3 className="text-2xl font-bold text-primary">{card.rewardPoints || card.rewardsPoints || 8500} Points</h3>
                <p className="text-xs text-on-surface-variant mt-1">Equivalent to ₹{(card.rewardPoints || 8500) * 0.25} cash credit</p>
              </div>
              <button className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] cursor-pointer">
                Redeem Points
              </button>
            </div>
          </div>
        )}

        {activeTab === 'emi' && (
          <div className="p-6 bg-surface-container rounded-2xl border border-white/5 text-center space-y-3 animate-fade-in">
            <ShieldAlert size={32} className="text-primary mx-auto" />
            <h4 className="text-sm font-bold text-on-surface">Instant EMI Conversion Available</h4>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">Convert eligible transactions above ₹2,500 into 3, 6, 9, or 12 month low-interest EMI plans.</p>
          </div>
        )}
      </div>

      {/* Security PIN Authorization Modal */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-6">
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[100000] text-on-surface flex flex-col gap-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl text-primary">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold m-0">Security PIN Authorization</h3>
                  <p className="text-[11px] text-on-surface-variant m-0">Card Controls &amp; Limit Modification Barrier</p>
                </div>
              </div>
              <button onClick={() => setSecurityModalOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-high">
                <X size={18} />
              </button>
            </div>

            {/* Target Card & Setting Summary */}
            <div className="p-3.5 bg-surface-high/60 border border-outline-variant/10 rounded-xl flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Card:</span>
                <span className="font-semibold text-on-surface">{card.name} ({card.maskedNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Security Level:</span>
                <span className="font-semibold text-tertiary flex items-center gap-1">
                  <ShieldCheck size={13} /> 256-bit Encrypted Setting Update
                </span>
              </div>
            </div>

            <form onSubmit={handleVerifyAndSave} className="flex flex-col gap-4 items-center text-center">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface text-sm">Enter 4-Digit Security PIN</label>
                <p className="text-[11px] text-on-surface-variant">
                  Confirm your 4-digit Security PIN to save these setting changes.
                </p>
              </div>

              <input
                type="password"
                maxLength={4}
                value={securityPin}
                onChange={(e) => {
                  setSecurityPin(e.target.value.replace(/\D/g, ''));
                  if (pinError) setPinError(null);
                }}
                placeholder="••••"
                autoFocus
                className="w-48 bg-surface-high border border-outline-variant/30 rounded-xl p-3.5 text-center text-2xl font-mono font-bold tracking-[0.4em] focus:outline-none focus:border-primary text-on-surface"
              />

              <span className="text-[11px] text-on-surface-variant">Demo Security PIN: <strong className="text-primary font-mono">1234</strong></span>

              {pinError && (
                <div className="w-full p-3 bg-error/10 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="flex gap-3 w-full pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  className="flex-1 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs hover:bg-surface-highest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || securityPin.length < 4}
                  className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Authorize & Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponents
function ToggleItem({ icon, title, desc, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-white/5">
      <div className="flex items-center gap-4">
        <div className="text-primary p-2 bg-primary/10 rounded-lg">
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <div>
          <h5 className="text-on-surface font-medium text-xs sm:text-sm">{title}</h5>
          <p className="text-on-surface-variant text-[11px] mt-0.5">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={!!checked} onChange={onChange} />
        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}

function LimitSlider({ title, value, max, step, disabled, onChange }: any) {
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  
  return (
    <div className={`transition-opacity ${disabled ? 'opacity-40' : 'opacity-100'}`}>
      <div className="flex justify-between items-end mb-2">
        <label className="text-xs sm:text-sm font-semibold text-on-surface">{title}</label>
        <span className="text-primary font-mono font-bold bg-primary/10 px-3 py-1 rounded-md text-xs border border-primary/20">
          {formatCurrency(value)}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-[11px] text-on-surface-variant mt-1 font-mono">
        <span>₹0</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}
