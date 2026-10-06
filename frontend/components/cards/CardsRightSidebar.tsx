"use client";

import React, { useState } from 'react';
import { BankCard, CardOffer } from '../../types';
import { Sparkles, Gift, ExternalLink, Activity, Copy, Check, X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface CardsRightSidebarProps {
  card: BankCard;
  offers: CardOffer[];
}

export default function CardsRightSidebar({ card, offers }: CardsRightSidebarProps) {
  const [offersModalOpen, setOffersModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CardOffer | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const isCredit = card.type === 'CREDIT';
  const rewards = card.rewardPoints || card.rewardsPoints || 8500;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleOfferClick = (offer: CardOffer) => {
    setSelectedOffer(offer);
    setOffersModalOpen(true);
  };

  const handleConfirmUpgrade = () => {
    setUpgradeSuccess(true);
    setTimeout(() => {
      setUpgradeSuccess(false);
      setUpgradeModalOpen(false);
    }, 1500);
  };

  const handleConfirmRedeem = () => {
    setRedeemSuccess(true);
    setTimeout(() => {
      setRedeemSuccess(false);
      setRedeemModalOpen(false);
    }, 1500);
  };

  return (
    <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
      
      {/* Spending Summary (Credit Card only) */}
      {isCredit && card.creditLimit && card.spentThisMonth !== undefined && (
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
          <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            Spending Summary
          </h3>
          
          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Spent This Month</p>
                <p className="text-xl font-bold text-on-surface">₹{card.spentThisMonth.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Limit</p>
                <p className="text-sm font-medium text-on-surface">₹{card.creditLimit.toLocaleString('en-IN')}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${(card.spentThisMonth / card.creditLimit) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-2 text-right">
              ₹{(card.creditLimit - card.spentThisMonth).toLocaleString('en-IN')} available
            </p>
          </div>
          
          <div className="space-y-3 mt-4">
            <p className="text-xs font-medium text-on-surface-variant">Top Categories</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface">Shopping</span>
              <span className="text-xs font-semibold text-on-surface">₹12,400</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface">Travel</span>
              <span className="text-xs font-semibold text-on-surface">₹8,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface">Dining</span>
              <span className="text-xs font-semibold text-on-surface">₹4,200</span>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Points */}
      <div className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-2xl p-5 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          Rewards Points
        </h3>
        <p className="text-3xl font-bold text-primary mb-1">
          {rewards.toLocaleString('en-IN')}
        </p>
        <p className="text-[11px] text-on-surface-variant mb-4">Worth ₹{Math.round(rewards * 0.25).toLocaleString('en-IN')} cash credit</p>
        <button 
          type="button"
          onClick={() => setRedeemModalOpen(true)}
          className="w-full bg-surface-container-highest hover:bg-white/10 text-on-surface text-xs font-bold py-2.5 rounded-xl transition-all border border-white/10 hover:border-primary/40"
        >
          Redeem Now
        </button>
      </div>

      {/* Card Offers */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Gift size={16} className="text-primary" />
            Offers on this Card
          </h3>
          <button 
            type="button"
            onClick={() => { setSelectedOffer(null); setOffersModalOpen(true); }} 
            className="text-xs text-primary font-semibold hover:underline"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {offers.map(offer => (
            <div 
              key={offer.id} 
              onClick={() => handleOfferClick(offer)}
              className="flex gap-3 items-center p-3 rounded-xl bg-surface-container border border-white/5 hover:border-primary/40 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <Gift size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">{offer.discountDesc || offer.discount}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">{offer.merchantName || offer.merchant} • Valid till {offer.validTill || offer.validUntil}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-gradient-to-tr from-primary/20 via-surface-container-low to-surface-container-low rounded-2xl p-5 border border-primary/30 text-center relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
        <h4 className="text-on-surface font-bold text-sm mb-1.5">Need a higher limit?</h4>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Upgrade to FinEdge Signature Card for premium benefits &amp; 4x rewards.</p>
        <button 
          type="button"
          onClick={() => setUpgradeModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary font-bold text-xs py-3 rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all"
        >
          Explore Upgrade <ExternalLink size={14} />
        </button>
      </div>

      {/* Card Offers Modal */}
      {offersModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Gift size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Card Offers &amp; Partner Benefits</h3>
                  <p className="text-[11px] text-on-surface-variant">Exclusive discounts on {card.name}</p>
                </div>
              </div>
              <button onClick={() => setOffersModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {offers.map(off => (
                <div key={off.id} className="p-4 bg-surface rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/30">
                        {off.discountDesc || off.discount}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface mt-2">{off.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">{off.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-on-surface-variant text-[11px]">Valid till {off.validTill || off.validUntil}</span>
                    {off.code ? (
                      <button 
                        type="button"
                        onClick={() => handleCopyCode(off.code!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-mono font-bold transition-all"
                      >
                        {copiedCode === off.code ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCode === off.code ? "COPIED!" : off.code}
                      </button>
                    ) : (
                      <span className="text-tertiary text-xs font-semibold">Auto-applied at checkout</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Card Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-base font-bold text-on-surface">Upgrade to FinEdge Signature</h3>
              </div>
              <button onClick={() => setUpgradeModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            {upgradeSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 size={44} className="text-tertiary animate-bounce" />
                <span className="text-sm font-bold text-on-surface">Upgrade Request Approved!</span>
                <p className="text-xs text-on-surface-variant">Your pre-approved ₹10,00,000 Signature card is activated. Your physical card will arrive in 3 days.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-on-surface-variant leading-relaxed">
                <div className="p-4 bg-surface rounded-xl border border-primary/30 space-y-2">
                  <div className="flex justify-between text-on-surface font-bold">
                    <span>Pre-Approved Credit Limit</span>
                    <span className="text-primary font-mono text-sm">₹10,00,000</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Annual Fee</span>
                    <span className="text-tertiary font-bold">₹0 (Lifetime Free)</span>
                  </div>
                </div>

                <ul className="space-y-2 text-on-surface font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" /> 4x Reward Points on international travel &amp; dining
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" /> Unlimited Airport Lounge Visits worldwide
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" /> $50,000 Complimentary Emergency Travel Insurance
                  </li>
                </ul>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setUpgradeModalOpen(false)}
                    className="flex-1 py-2.5 bg-surface-high text-on-surface font-medium rounded-xl hover:bg-surface-highest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmUpgrade}
                    className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center justify-center gap-1.5"
                  >
                    Confirm Upgrade <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Redeem Points Modal */}
      {redeemModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-[10000]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles size={20} className="text-primary" />
                <h3 className="text-base font-bold text-on-surface">Redeem Reward Points</h3>
              </div>
              <button onClick={() => setRedeemModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            {redeemSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 size={44} className="text-tertiary animate-bounce" />
                <span className="text-sm font-bold text-on-surface">Cash Credit Applied!</span>
                <p className="text-xs text-on-surface-variant">₹{Math.round(rewards * 0.25).toLocaleString('en-IN')} has been credited directly to primary savings account {card.linkedAccountId}.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-on-surface-variant">
                <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-1.5 text-center">
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Points to Redeem</span>
                  <p className="text-2xl font-bold text-primary">{rewards.toLocaleString('en-IN')} Points</p>
                  <p className="text-xs text-tertiary font-bold">Convert to ₹{Math.round(rewards * 0.25).toLocaleString('en-IN')} Account Credit</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setRedeemModalOpen(false)}
                    className="flex-1 py-2.5 bg-surface-high text-on-surface font-medium rounded-xl hover:bg-surface-highest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmRedeem}
                    className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
                  >
                    Confirm Credit
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
