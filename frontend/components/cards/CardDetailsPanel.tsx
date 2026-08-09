import React, { useState } from 'react';
import { BankCard } from '../../types';
import CardVisual from './CardVisual';
import { Eye, EyeOff, Snowflake, KeyRound, FileText, AlertOctagon, RefreshCcw, ShieldCheck, X } from 'lucide-react';

interface CardDetailsPanelProps {
  card: BankCard;
  onStatusToggle: (status: "ACTIVE" | "FROZEN") => void;
}

export default function CardDetailsPanel({ card, onStatusToggle }: CardDetailsPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const isFrozen = card.status === 'FROZEN';

  const handleRevealClick = () => {
    if (showDetails) {
      setShowDetails(false);
    } else {
      setOtpModalOpen(true);
      setOtp('');
      setError('');
    }
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') { // Mock OTP validation
      setShowDetails(true);
      setOtpModalOpen(false);
    } else {
      setError('Invalid OTP. Please enter 123456 for demo.');
    }
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 mb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side - Card Visual Display */}
        <div className="flex-shrink-0 flex items-center justify-center lg:justify-start">
          <div className="pointer-events-none scale-90 sm:scale-100 origin-top-left">
            <CardVisual card={card} showDetails={showDetails} />
          </div>
        </div>

        {/* Right Side - Details & Actions */}
        <div className="flex-1 flex flex-col justify-between">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-on-surface mb-1">{card.name}</h3>
              <p className="text-on-surface-variant text-sm">Linked to Account: {card.linkedAccountId}</p>
            </div>
            
            {/* Status Badge & Toggle */}
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border ${
                card.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                card.status === 'FROZEN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {card.status}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={!isFrozen && card.status !== 'BLOCKED'}
                  disabled={card.status === 'BLOCKED'}
                  onChange={() => onStatusToggle(isFrozen ? "ACTIVE" : "FROZEN")}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-container rounded-xl p-4 border border-white/5">
              <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider">Card Number</p>
              <div className="flex items-center justify-between">
                <p className="text-on-surface font-mono font-medium">
                  {showDetails ? card.fullNumber : card.maskedNumber}
                </p>
                <button onClick={handleRevealClick} className="text-primary hover:text-primary/80 transition-colors">
                  {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-4 border border-white/5">
              <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider">CVV / Expiry</p>
              <div className="flex items-center justify-between">
                <p className="text-on-surface font-mono font-medium">
                  {showDetails ? card.cvv : '•••'} <span className="text-on-surface-variant/50 mx-2">|</span> {card.expiry}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => onStatusToggle(isFrozen ? "ACTIVE" : "FROZEN")}
              disabled={card.status === 'BLOCKED'}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-sm text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Snowflake size={16} className={isFrozen ? "text-blue-400" : ""} />
              {isFrozen ? "Unfreeze Card" : "Freeze Card"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-sm text-on-surface transition-colors">
              <KeyRound size={16} /> PIN
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-sm text-on-surface transition-colors">
              <FileText size={16} /> Statement
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-sm text-on-surface transition-colors">
              <RefreshCcw size={16} /> Replace
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors ml-auto">
              <AlertOctagon size={16} /> Report Lost
            </button>
          </div>

        </div>
      </div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Security Check</h3>
              </div>
              <button onClick={() => setOtpModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-on-surface-variant text-sm mb-6">
              To view sensitive card details, please enter the 6-digit OTP sent to your registered mobile number.
            </p>
            
            <input 
              type="text" 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 123456"
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-center tracking-[0.5em] font-mono text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all mb-2"
            />
            {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}
            
            <button 
              onClick={handleVerifyOtp}
              className="w-full bg-primary text-on-primary font-medium py-3 rounded-xl mt-4 hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all"
            >
              Verify & Reveal Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
