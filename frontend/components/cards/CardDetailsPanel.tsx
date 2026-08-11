"use client";

import React, { useState } from 'react';
import { BankCard } from '../../types';
import CardVisual from './CardVisual';
import { 
  Eye, EyeOff, Snowflake, KeyRound, FileText, AlertOctagon, 
  RefreshCcw, ShieldCheck, X, CheckCircle2, AlertTriangle, Lock
} from 'lucide-react';
import { CardStatementBuilder } from '../../lib/pdf/documents/CardStatement';

interface CardDetailsPanelProps {
  card: BankCard;
  onStatusToggle: (status: "ACTIVE" | "FROZEN" | "BLOCKED") => void;
}

export default function CardDetailsPanel({ card, onStatusToggle }: CardDetailsPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  // PIN Modal State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Replace Modal State
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceSuccess, setReplaceSuccess] = useState(false);

  // Report Lost Modal State
  const [reportLostModalOpen, setReportLostModalOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Statement PDF Download State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
    if (otp === '123456') {
      setShowDetails(true);
      setOtpModalOpen(false);
    } else {
      setError('Invalid OTP. Please enter 123456 for demo.');
    }
  };

  const handleSetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || newPin !== confirmPin) return;
    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      setPinModalOpen(false);
      setNewPin('');
      setConfirmPin('');
    }, 1500);
  };

  const accountContextFallback = 'Linked Savings Account';

  const handleDownloadStatement = async () => {
    setIsGeneratingPdf(true);
    const cardName = card.cardholderName || (card as any).cardHolderName || "FinEdge Customer";
    
    // Mock transactions for the demo PDF
    const mockTxs: any[] = [
      { timestamp: '2026-08-05T10:00:00Z', merchantName: 'Amazon.in Online Purchase', amount: 4599.00, type: 'DEBIT', status: 'COMPLETED' },
      { timestamp: '2026-08-02T14:30:00Z', merchantName: 'Zomato Fine Dining', amount: 850.50, type: 'DEBIT', status: 'COMPLETED' },
      { timestamp: '2026-07-28T09:15:00Z', merchantName: 'Cash Credit Reward', amount: 1500.00, type: 'CREDIT', status: 'COMPLETED' }
    ];

    setTimeout(() => {
      CardStatementBuilder.generate(card, cardName, accountContextFallback, mockTxs);
      setIsGeneratingPdf(false);
    }, 800);
  };

  const handleConfirmReplace = () => {
    setReplaceSuccess(true);
    setTimeout(() => {
      setReplaceSuccess(false);
      setReplaceModalOpen(false);
    }, 1500);
  };

  const handleConfirmReportLost = () => {
    onStatusToggle("BLOCKED");
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportLostModalOpen(false);
    }, 1500);
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 mb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side - Card Visual Display */}
        <div className="flex-shrink-0 flex items-center justify-center lg:justify-start">
          <div className="scale-90 sm:scale-100 origin-top-left">
            <CardVisual card={card} showDetails={showDetails} enableFlip={true} />
          </div>
        </div>

        {/* Right Side - Details & Actions */}
        <div className="flex-1 flex flex-col justify-between">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-on-surface mb-1">{card.name}</h3>
              <p className="text-on-surface-variant text-sm font-mono">Linked Account: {card.linkedAccountId || "ACC-001"}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-container rounded-xl p-4 border border-white/5">
              <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider">Card Number</p>
              <div className="flex items-center justify-between">
                <p className="text-on-surface font-mono font-medium tracking-wider">
                  {showDetails ? (card.fullNumber || card.cardNumber) : card.maskedNumber}
                </p>
                <button 
                  type="button"
                  onClick={handleRevealClick} 
                  className="text-primary hover:text-primary/80 transition-colors p-1"
                  title={showDetails ? "Hide Card Number" : "Reveal Card Number"}
                >
                  {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-4 border border-white/5">
              <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider">CVV / Expiry</p>
              <div className="flex items-center justify-between">
                <p className="text-on-surface font-mono font-medium tracking-wider">
                  {showDetails ? card.cvv : '•••'} <span className="text-on-surface-variant/50 mx-2">|</span> {card.expiry || card.expiryDate}
                </p>
                <button 
                  type="button"
                  onClick={handleRevealClick} 
                  className="text-primary hover:text-primary/80 transition-colors p-1"
                  title={showDetails ? "Hide CVV" : "Reveal CVV"}
                >
                  {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-wrap gap-3">
            <button 
              type="button"
              onClick={() => onStatusToggle(isFrozen ? "ACTIVE" : "FROZEN")}
              disabled={card.status === 'BLOCKED'}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-semibold text-on-surface transition-all border border-outline-variant/10 disabled:opacity-50"
            >
              <Snowflake size={16} className={isFrozen ? "text-blue-400 animate-spin" : ""} />
              {isFrozen ? "Unfreeze Card" : "Freeze Card"}
            </button>
            <button 
              type="button"
              onClick={() => setPinModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-semibold text-on-surface transition-all border border-outline-variant/10"
            >
              <KeyRound size={16} className="text-primary" /> PIN
            </button>
            <button 
              type="button"
              onClick={handleDownloadStatement}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-semibold text-on-surface transition-all border border-outline-variant/10 disabled:opacity-50"
            >
              <FileText size={16} className="text-tertiary" /> {isGeneratingPdf ? "Generating..." : "Statement"}
            </button>
            <button 
              type="button"
              onClick={() => setReplaceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-semibold text-on-surface transition-all border border-outline-variant/10"
            >
              <RefreshCcw size={16} className="text-secondary" /> Replace
            </button>
            <button 
              type="button"
              onClick={() => setReportLostModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-error/30 text-error hover:bg-error/10 rounded-xl text-xs font-semibold transition-all ml-auto"
            >
              <AlertOctagon size={16} /> Report Lost
            </button>
          </div>

        </div>
      </div>

      {/* OTP Reveal Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-[10000]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Security Verification</h3>
              </div>
              <button onClick={() => setOtpModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-on-surface-variant text-xs leading-relaxed mb-6">
              To reveal sensitive card number and CVV details, enter the 6-digit OTP sent to your registered mobile number.
            </p>
            
            <input 
              type="text" 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 123456"
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-center tracking-[0.5em] font-mono text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all mb-2"
            />
            {error && <p className="text-error text-xs text-center mb-4">{error}</p>}
            
            <button 
              onClick={handleVerifyOtp}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl mt-4 hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all text-xs"
            >
              Verify & Reveal Details
            </button>
          </div>
        </div>
      )}

      {/* PIN Reset Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-[10000]">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <KeyRound size={18} />
                </div>
                <h3 className="text-base font-bold text-on-surface">Set Card PIN</h3>
              </div>
              <button onClick={() => setPinModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            {pinSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 size={44} className="text-tertiary animate-bounce" />
                <span className="text-sm font-bold text-on-surface">Card PIN Updated!</span>
                <p className="text-xs text-on-surface-variant">Your new 4-digit PIN is active immediately for ATM and POS transactions.</p>
              </div>
            ) : (
              <form onSubmit={handleSetPinSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-on-surface-variant">New 4-Digit PIN</label>
                  <input 
                    type="password"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-[0.5em] text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-on-surface-variant">Confirm New PIN</label>
                  <input 
                    type="password"
                    maxLength={4}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-[0.5em] text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                {newPin && confirmPin && newPin !== confirmPin && (
                  <p className="text-xs text-error font-medium text-center">PINs do not match</p>
                )}

                <button 
                  type="submit"
                  disabled={newPin.length !== 4 || newPin !== confirmPin}
                  className="w-full mt-2 bg-primary text-on-primary font-bold py-3 rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-40 transition-all text-xs"
                >
                  Update Card PIN
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Replace Card Modal */}
      {replaceModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <RefreshCcw size={20} className="text-secondary" />
                <h3 className="text-base font-bold text-on-surface">Request Replacement Card</h3>
              </div>
              <button onClick={() => setReplaceModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            {replaceSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 size={44} className="text-tertiary animate-bounce" />
                <span className="text-sm font-bold text-on-surface">Replacement Card Requested!</span>
                <p className="text-xs text-on-surface-variant">Your new card will be delivered to your registered branch address within 3-5 business days.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs text-on-surface-variant leading-relaxed">
                <p>Are you sure you want to request a replacement for <strong>{card.name}</strong> ({card.maskedNumber})?</p>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 font-mono text-[11px] text-on-surface">
                  ● Delivery Address: Connaught Place, New Delhi Branch<br/>
                  ● Fee: Free (Complimentary re-issue)
                </div>
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => setReplaceModalOpen(false)}
                    className="flex-1 py-2.5 bg-surface-high text-on-surface font-medium rounded-xl hover:bg-surface-highest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmReplace}
                    className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
                  >
                    Confirm Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Lost Modal */}
      {reportLostModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="bg-surface-container border border-error/30 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5 text-error">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold">Report Stolen / Lost Card</h3>
              </div>
              <button onClick={() => setReportLostModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            {reportSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Lock size={44} className="text-error animate-bounce" />
                <span className="text-sm font-bold text-on-surface">Card Blocked Immediately!</span>
                <p className="text-xs text-on-surface-variant">Your card has been placed in frozen status for security. Reference ticket #SEC-9921 generated.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs text-on-surface-variant leading-relaxed">
                <p>This will immediately block all transactions on <strong>{card.name}</strong> ({card.maskedNumber}).</p>
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error font-medium">
                  ⚠️ Action is instant and prevents unauthorized ATM, online, or POS charges.
                </div>
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => setReportLostModalOpen(false)}
                    className="flex-1 py-2.5 bg-surface-high text-on-surface font-medium rounded-xl hover:bg-surface-highest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmReportLost}
                    className="flex-1 py-2.5 bg-error text-white font-bold rounded-xl hover:bg-error/90"
                  >
                    Block Card Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
