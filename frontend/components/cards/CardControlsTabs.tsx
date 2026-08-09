import React, { useState } from 'react';
import { BankCard, CardControls } from '../../types';
import { Globe, ShoppingBag, Wifi, CreditCard as CreditCardIcon, Landmark } from 'lucide-react';

interface CardControlsTabsProps {
  card: BankCard;
  onUpdateControls: (controls: CardControls) => void;
}

export default function CardControlsTabs({ card, onUpdateControls }: CardControlsTabsProps) {
  const [activeTab, setActiveTab] = useState('controls');
  const [controls, setControls] = useState<CardControls>(card.controls);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state if card changes
  React.useEffect(() => {
    setControls(card.controls);
    setHasChanges(false);
  }, [card]);

  const handleToggle = (key: keyof CardControls) => {
    setControls(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleLimitChange = (key: keyof CardControls, value: number) => {
    setControls(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateControls(controls);
    setHasChanges(false);
  };

  const tabs = [
    { id: 'controls', label: 'Card Controls' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'rewards', label: 'Rewards & Offers' },
    ...(card.type === 'CREDIT' ? [{ id: 'emi', label: 'EMI on Card' }] : [])
  ];

  return (
    <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-white/5 bg-surface-container-low">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
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
                checked={controls.internationalUsage} 
                onChange={() => handleToggle('internationalUsage')} 
              />
              <ToggleItem 
                icon={<Wifi />} title="Contactless Payments" 
                desc="Tap to pay at supported terminals" 
                checked={controls.contactlessPayments} 
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
              <h4 className="text-lg font-bold text-on-surface mb-6">Spending Limits (Daily)</h4>
              <div className="space-y-6 max-w-2xl">
                <LimitSlider 
                  title="ATM Withdrawal Limit" 
                  value={controls.dailyAtmLimit} 
                  max={200000} 
                  step={5000}
                  disabled={!controls.atmWithdrawals}
                  onChange={(val) => handleLimitChange('dailyAtmLimit', val)} 
                />
                <LimitSlider 
                  title="POS Transaction Limit" 
                  value={controls.dailyPosLimit} 
                  max={500000} 
                  step={10000}
                  disabled={!controls.posTransactions}
                  onChange={(val) => handleLimitChange('dailyPosLimit', val)} 
                />
                <LimitSlider 
                  title="Online Transaction Limit" 
                  value={controls.onlineLimit} 
                  max={500000} 
                  step={10000}
                  disabled={!controls.onlineTransactions}
                  onChange={(val) => handleLimitChange('onlineLimit', val)} 
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-medium hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="py-12 text-center animate-fade-in">
            <p className="text-on-surface-variant">View all transactions for this card here.</p>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="py-12 text-center animate-fade-in">
            <p className="text-on-surface-variant">Explore rewards, points, and cashback offers.</p>
          </div>
        )}

        {activeTab === 'emi' && (
          <div className="py-12 text-center animate-fade-in">
            <p className="text-on-surface-variant">Convert large transactions into easy EMIs.</p>
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
          <h5 className="text-on-surface font-medium text-sm">{title}</h5>
          <p className="text-on-surface-variant text-[11px] mt-0.5">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
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
        <label className="text-sm font-medium text-on-surface">{title}</label>
        <span className="text-primary font-medium bg-primary/10 px-3 py-1 rounded-md text-sm border border-primary/20">
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
      <div className="flex justify-between text-[11px] text-on-surface-variant mt-1">
        <span>₹0</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}
