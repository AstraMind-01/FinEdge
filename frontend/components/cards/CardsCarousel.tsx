import React from 'react';
import { BankCard } from '../../types';
import CardVisual from './CardVisual';

interface CardsCarouselProps {
  cards: BankCard[];
  selectedCardId: string;
  onSelectCard: (id: string) => void;
}

export default function CardsCarousel({ cards, selectedCardId, onSelectCard }: CardsCarouselProps) {
  return (
    <div className="w-full mb-8 relative">
      <div className="flex gap-6 overflow-x-auto pb-6 pt-6 px-6 hide-scrollbar snap-x perspective-[1000px]">
        {cards.map((card) => {
          const isVirtual = card.tier === 'Virtual' || card.name?.toLowerCase().includes('virtual');
          
          return (
            <div key={card.id} className="snap-center relative transition-transform duration-300 py-2 px-1">
              {card.status === 'FROZEN' && (
                <div className="absolute -top-3 right-4 z-50 bg-cyan-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg shadow-cyan-500/40 uppercase tracking-wide border border-cyan-300">
                  FROZEN
                </div>
              )}

              {card.status === 'BLOCKED' && (
                <div className="absolute -top-3 right-4 z-50 bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg shadow-red-600/40 uppercase tracking-wide border border-red-400">
                  BLOCKED
                </div>
              )}

              {card.isDefault && card.status === 'ACTIVE' && (
                <div className="absolute -top-3 right-4 z-20 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/30 uppercase tracking-wide border border-primary/50">
                  Default
                </div>
              )}

              {isVirtual && !card.isDefault && card.status === 'ACTIVE' && (
                <div className="absolute -top-3 right-4 z-20 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg shadow-emerald-500/40 uppercase tracking-wide border border-emerald-400">
                  Virtual Card
                </div>
              )}

              <CardVisual 
                card={card} 
                isSelected={selectedCardId === card.id}
                onClick={() => onSelectCard(card.id)}
                enableFlip={false}
              />
            </div>
          );
        })}
      </div>
      
      {/* Pagination indicators */}
      <div className="flex justify-center items-center gap-2 mt-[-6px]">
        {cards.map((card) => (
          <button 
            type="button"
            key={`dot-${card.id}`}
            onClick={() => onSelectCard(card.id)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              selectedCardId === card.id ? 'w-8 bg-primary shadow-[0_0_10px_rgba(240,180,41,0.5)]' : 'w-2 bg-outline-variant/40 hover:bg-outline-variant'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
