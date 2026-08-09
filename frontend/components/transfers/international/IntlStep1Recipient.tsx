import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { IntlBeneficiary } from '../../../types';
import { UserPlus, Users, ChevronRight, Info } from 'lucide-react';

interface IntlStep1RecipientProps {
  beneficiaries: IntlBeneficiary[];
  selectedRecipient?: IntlBeneficiary | null;
  onSelectRecipient: (recipient: IntlBeneficiary) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function IntlStep1Recipient({
  beneficiaries, selectedRecipient, onSelectRecipient, onNext, onCancel
}: IntlStep1RecipientProps) {
  
  const [activeTab, setActiveTab] = useState<'saved' | 'new'>('saved');

  // Dummy state for new recipient form
  const [newRecip, setNewRecip] = useState({
    name: '', country: '', bankName: '', swiftCode: '', iban: ''
  });

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden min-h-[500px]">
      
      {/* Tabs */}
      <div className="flex items-center w-full bg-surface border-b border-outline-variant/10 p-2">
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold transition-all ${
            activeTab === 'saved' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Users size={16} /> Saved Recipients
        </button>
        <button 
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold transition-all ${
            activeTab === 'new' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <UserPlus size={16} /> New Recipient
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {activeTab === 'saved' ? (
          <div className="flex flex-col gap-4">
            {beneficiaries.map(b => (
              <div 
                key={b.id}
                onClick={() => onSelectRecipient(b)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedRecipient?.id === b.id 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                    : 'border-outline-variant/20 bg-surface hover:border-outline-variant/40 hover:bg-surface-high'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full border border-outline-variant/40 flex items-center justify-center shrink-0">
                    {selectedRecipient?.id === b.id && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-center text-[20px]">
                    {getFlagEmoji(b.countryCode)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[15px] text-on-surface">{b.name}</span>
                    <span className="text-[12px] text-on-surface-variant">{b.bankName} • {b.country}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-[13px] font-mono text-on-surface">{b.iban.substring(0, 4)} **** {b.iban.slice(-4)}</span>
                  <span className="text-[11px] text-on-surface-variant">SWIFT: {b.swiftCode}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 w-full max-w-lg mx-auto py-2">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">Recipient Full Name</label>
              <input 
                type="text" 
                value={newRecip.name}
                onChange={e => setNewRecip({...newRecip, name: e.target.value})}
                className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" 
                placeholder="As it appears on their bank account" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">Country</label>
              <select className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50">
                <option value="">Select country...</option>
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="EU">🇪🇺 Eurozone</option>
                <option value="AE">🇦🇪 United Arab Emirates</option>
                <option value="SG">🇸🇬 Singapore</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-on-surface-variant flex items-center gap-1">
                  SWIFT / BIC Code <Info size={12} className="text-primary cursor-help" />
                </label>
                <input 
                  type="text" 
                  className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 font-mono uppercase" 
                  placeholder="8 or 11 characters" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-on-surface-variant">IBAN / Account Number</label>
                <input 
                  type="text" 
                  className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 font-mono" 
                  placeholder="IBAN or Local AC" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">Recipient Address</label>
              <input 
                type="text" 
                className="w-full h-[48px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" 
                placeholder="Required by most international banks" 
              />
            </div>

            <div className="flex items-center gap-3 mt-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <input type="checkbox" id="saveBen" className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary" />
              <label htmlFor="saveBen" className="text-[13px] text-on-surface cursor-pointer select-none">Save this recipient for future transfers</label>
            </div>

          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between mt-auto">
        <button className="text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors" onClick={onCancel}>
          Cancel
        </button>
        <Button 
          disabled={activeTab === 'saved' ? !selectedRecipient : !newRecip.name}
          onClick={onNext}
          className="bg-primary text-on-primary h-[44px] px-8 font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow flex items-center gap-2"
        >
          Continue <ChevronRight size={16} />
        </Button>
      </div>

    </Card>
  );
}
