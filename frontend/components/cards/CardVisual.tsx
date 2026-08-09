import React from 'react';
import { BankCard } from '../../types';

interface CardVisualProps {
  card: BankCard;
  isSelected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
}

export default function CardVisual({ card, isSelected = false, onClick, showDetails = false }: CardVisualProps) {
  const isCredit = card.type === 'CREDIT';
  
  // Theme gradients
  const gradients = {
    "purple-gold": "bg-gradient-to-br from-[#2D1B4E] via-[#4A2B7F] to-[#1E1136]",
    "navy-gold": "bg-gradient-to-br from-[#0B1A30] via-[#1A2E4C] to-[#050C17]",
    "teal-silver": "bg-gradient-to-br from-[#0B2B2F] via-[#14494E] to-[#041416]"
  };

  const bgClass = gradients[card.theme] || gradients["navy-gold"];
  
  return (
    <div 
      onClick={onClick}
      className={`relative w-[320px] h-[200px] rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-all cursor-pointer shrink-0 group ${bgClass} ${isSelected ? 'ring-2 ring-primary ring-offset-4 ring-offset-surface-container' : 'hover:-translate-y-2'}`}
      style={{
        boxShadow: isSelected 
          ? '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(240,180,41,0.2)' 
          : '0 20px 40px -10px rgba(0,0,0,0.8)'
      }}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none"></div>
      
      {/* Circles pattern */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top row: Type/Logo and Network */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <span className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">{card.type} CARD</span>
          <span className="text-white text-lg font-bold tracking-tight">FinEdge</span>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-primary text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 uppercase">
             {card.tier}
           </span>
        </div>
      </div>

      {/* Chip and Contactless */}
      <div className="flex items-center gap-3 relative z-10 my-1">
        {/* SVG Chip */}
        <div className="w-10 h-8 bg-gradient-to-br from-[#ffd700] to-[#b8860b] rounded-[4px] relative overflow-hidden border border-[#8b6508]">
          <div className="absolute inset-0 border border-white/20 rounded-[4px]"></div>
          {/* Chip lines */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black/20"></div>
          <div className="absolute top-[20%] left-0 w-full h-[1px] bg-black/20"></div>
          <div className="absolute top-[80%] left-0 w-full h-[1px] bg-black/20"></div>
          <div className="absolute rounded-sm inset-1 border border-black/10"></div>
        </div>
        {/* Contactless Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
          <path d="M8.5 16.5a4.5 4.5 0 0 1 0-9"></path>
          <path d="M11.5 19.5a7.5 7.5 0 0 1 0-15"></path>
          <path d="M14.5 22.5a10.5 10.5 0 0 1 0-21"></path>
        </svg>
      </div>

      {/* Card Number */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-xl tracking-[0.2em] text-white/90 shadow-sm drop-shadow-md">
          {showDetails ? card.fullNumber : card.maskedNumber}
        </span>
      </div>

      {/* Bottom row: Name, Expiry, Logo */}
      <div className="flex justify-between items-end relative z-10">
        <div className="flex flex-col">
          <span className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5">Card Holder</span>
          <span className="text-white text-sm font-medium tracking-wider uppercase">{card.cardholderName}</span>
        </div>
        <div className="flex flex-col items-center px-4">
          <span className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5">Expires</span>
          <span className="font-mono text-white text-sm tracking-wider">{card.expiry}</span>
        </div>
        <div className="w-12 flex justify-end">
          {card.network === 'VISA' ? (
             <svg viewBox="0 0 50 16" className="h-4 w-auto fill-white opacity-90">
               <path d="M22.04 15.68l3.15-9.87h5.11l-3.15 9.87h-5.11zm15.19-9.61c-1.02-.38-2.67-.81-4.71-.81-5.07 0-8.65 2.65-8.67 6.45-.02 2.81 2.55 4.38 4.49 5.32 1.99.95 2.66 1.57 2.66 2.42-.02 1.31-1.6 1.92-3.08 1.92-2.07 0-3.17-.32-4.88-1.09l-.68-.32-1.42 8.65c1.2.55 3.42 1.02 5.75 1.05 5.4 0 8.92-2.61 8.95-6.66.02-2.22-1.32-3.9-4.32-5.29-1.78-.88-2.88-1.46-2.88-2.36.02-1.18 1.34-1.85 3.01-1.85 1.63-.04 2.82.34 3.79.77l.46.22 1.48-8.59zm12.39 9.61h4.74l-4.14-9.87h-4.33c-1.04 0-1.82.29-2.27 1.32l-7.9 18.42h5.36l1.06-2.97h6.54l.6 2.97h5.35l-4.14-9.87z"/>
             </svg>
          ) : (
             <svg viewBox="0 0 36 22" className="h-6 w-auto opacity-90">
               <circle cx="11" cy="11" r="11" fill="#EB001B"/>
               <circle cx="25" cy="11" r="11" fill="#F79E1B"/>
               <path d="M18 11c0-3.52 1.65-6.65 4.19-8.73-2.54 2.08-4.19 5.21-4.19 8.73s1.65 6.65 4.19 8.73C19.65 17.65 18 14.52 18 11z" fill="#FF5F00"/>
             </svg>
          )}
        </div>
      </div>
    </div>
  );
}
