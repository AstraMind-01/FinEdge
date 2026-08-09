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
      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2 hide-scrollbar snap-x">
        {cards.map((card) => (
          <div key={card.id} className="snap-center relative">
            {card.isDefault && (
              <div className="absolute -top-3 right-4 z-20 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/30 uppercase tracking-wide border border-primary/50">
                Default
              </div>
            )}
            <CardVisual 
              card={card} 
              isSelected={selectedCardId === card.id}
              onClick={() => onSelectCard(card.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Pagination indicators (if we want to fake a carousel feel) */}
      <div className="flex justify-center gap-2 mt-[-10px]">
        {cards.map((card) => (
           <div 
             key={`dot-${card.id}`}
             className={`h-1.5 rounded-full transition-all ${selectedCardId === card.id ? 'w-6 bg-primary' : 'w-1.5 bg-outline-variant/40 hover:bg-outline-variant'}`}
           />
        ))}
      </div>
    </div>
  );
}
