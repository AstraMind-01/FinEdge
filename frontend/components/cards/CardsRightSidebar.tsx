import React from 'react';
import { BankCard, CardOffer } from '../../types';
import { Sparkles, Gift, ExternalLink, Activity } from 'lucide-react';

interface CardsRightSidebarProps {
  card: BankCard;
  offers: CardOffer[];
}

export default function CardsRightSidebar({ card, offers }: CardsRightSidebarProps) {
  const isCredit = card.type === 'CREDIT';
  
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
              <span className="text-sm text-on-surface">Shopping</span>
              <span className="text-sm font-medium text-on-surface">₹12,400</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface">Travel</span>
              <span className="text-sm font-medium text-on-surface">₹8,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface">Dining</span>
              <span className="text-sm font-medium text-on-surface">₹4,200</span>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Points */}
      {isCredit && card.rewardsPoints !== undefined && (
        <div className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none"></div>
          <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            Rewards Points
          </h3>
          <p className="text-3xl font-bold text-primary mb-1">
            {card.rewardsPoints.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-on-surface-variant mb-4">120 points expiring soon</p>
          <button className="w-full bg-surface-container-highest hover:bg-white/10 text-on-surface text-sm font-medium py-2 rounded-lg transition-colors border border-white/5">
            Redeem Now
          </button>
        </div>
      )}

      {/* Card Offers */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Gift size={16} className="text-primary" />
            Offers on this Card
          </h3>
          <a href="#" className="text-xs text-primary hover:underline">View All</a>
        </div>
        
        <div className="space-y-3">
          {offers.map(offer => (
            <div key={offer.id} className="flex gap-3 items-center p-3 rounded-xl bg-surface-container border border-white/5 hover:border-primary/30 transition-colors group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Gift size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-on-surface">{offer.discountDesc}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{offer.merchantName} • Valid till {offer.validTill}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Promo */}
      <div className="bg-gradient-to-tr from-primary/20 to-surface-container-low rounded-2xl p-5 border border-primary/20 text-center">
        <h4 className="text-on-surface font-bold mb-2">Need a higher limit?</h4>
        <p className="text-sm text-on-surface-variant mb-4">Upgrade to FinEdge Signature Card for premium benefits.</p>
        <button className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary font-medium py-2 rounded-lg hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all">
          Explore Upgrade <ExternalLink size={14} />
        </button>
      </div>

    </div>
  );
}
