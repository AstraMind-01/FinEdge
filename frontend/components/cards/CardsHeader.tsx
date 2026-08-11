import React from 'react';
import { Plus } from 'lucide-react';

interface CardsHeaderProps {
  onApplyClick?: () => void;
}

export default function CardsHeader({ onApplyClick }: CardsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 mt-4">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">My Cards</h1>
        <p className="text-on-surface-variant text-[15px]">Manage your debit and credit cards in one place</p>
      </div>
      
      <button 
        onClick={onApplyClick}
        className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-medium hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer"
      >
        <Plus size={18} />
        Apply for New Card
      </button>
    </div>
  );
}
