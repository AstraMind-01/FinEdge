"use client";

import React, { useState } from 'react';
import { BankCard, CardControls } from '../../types';
import { Globe, ShoppingBag, Wifi, CreditCard as CreditCardIcon, Landmark, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface CardControlsTabsProps {
  card: BankCard;
  onUpdateControls: (controls: CardControls) => void;
}

export default function CardControlsTabs({ card, onUpdateControls }: CardControlsTabsProps) {
  const [activeTab, setActiveTab] = useState('controls');
  const [controls, setControls] = useState<CardControls>(card.controls);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

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

  const handleSave = () => {
    onUpdateControls(controls);
    setHasChanges(false);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
    }, 3000);
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
        <div className="absolute top-3 right-4 z-30 bg-tertiary-container border border-tertiary/30 text-on-tertiary-container text-xs font-semibold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-tertiary" />
          <span>Card controls &amp; limits saved successfully!</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-white/5 bg-surface-container-low">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all relative ${
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
            <div className="flex justify-end pt-4">
              <button 
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Save Changes
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
              <button className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]">
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
