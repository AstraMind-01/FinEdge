"use client";

import React, { useState, useRef } from 'react';
import { BankCard } from '../../types';
import { RotateCw } from 'lucide-react';

interface CardVisualProps {
  card: BankCard;
  isSelected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
  enableFlip?: boolean;
}

export default function CardVisual({ 
  card, 
  isSelected = false, 
  onClick, 
  showDetails = false,
  enableFlip = false 
}: CardVisualProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const isVirtual = card.tier === 'Virtual' || card.name?.toLowerCase().includes('virtual');

  // Theme gradients
  const gradients = {
    "purple-gold": "bg-gradient-to-br from-[#2D1B4E] via-[#4A2B7F] to-[#1E1136]",
    "navy-gold": "bg-gradient-to-br from-[#0B1A30] via-[#1A2E4C] to-[#050C17]",
    "teal-silver": "bg-gradient-to-br from-[#032B2B] via-[#094A46] to-[#021817]"
  };

  const bgClass = gradients[card.theme as keyof typeof gradients] || 
                 (isVirtual ? "bg-gradient-to-br from-[#042F2C] via-[#0D5C56] to-[#021715]" : gradients["navy-gold"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rY = ((mouseX / width) - 0.5) * 16; // Mouse tilt Y
    const rX = -((mouseY / height) - 0.5) * 16; // Mouse tilt X

    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (enableFlip) {
      setIsFlipped(!isFlipped);
    }
    if (onClick) onClick();
  };

  const currentFlipAngle = (enableFlip && isFlipped) ? 180 : 0;

  return (
    <div className="perspective-[1000px] inline-block select-none">
      <div 
        ref={cardRef}
        onClick={handleCardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-[320px] h-[200px] rounded-2xl transition-transform duration-500 ease-out cursor-pointer shrink-0 group ${
          isSelected 
            ? 'scale-[1.03] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.9),0_0_25px_rgba(240,180,41,0.35)] ring-2 ring-primary ring-offset-4 ring-offset-surface-container' 
            : 'hover:scale-[1.02] opacity-95 hover:opacity-100'
        }`}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY + currentFlipAngle}deg) translateZ(${isSelected ? 10 : 0}px)`,
          transformStyle: 'preserve-3d'
        }}
      >
        
        {/* Flip Trigger Hint Icon (Only if enableFlip is true) */}
        {enableFlip && (
          <div 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
            className="absolute -bottom-2 -right-2 z-40 bg-surface-container-highest/90 border border-white/20 text-primary p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            title="Click to flip card (3D Rotation)"
          >
            <RotateCw size={14} className={`transition-transform duration-500 ${isFlipped ? 'rotate-180 text-emerald-400' : ''}`} />
          </div>
        )}

        {/* Specular Glare Sheen Layer */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl z-30"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 50%, transparent 80%)`,
            backfaceVisibility: 'hidden'
          }}
        />

        {/* ==================== FRONT FACE ==================== */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden ${bgClass}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Glossy Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-40 pointer-events-none z-10"></div>
          
          {/* Holographic Glowing Orbs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isVirtual ? 'bg-emerald-400/20' : 'bg-primary/20'}`}></div>

          {/* Top row: Type/Logo and Network */}
          <div className="flex justify-between items-start relative z-20">
            <div className="flex flex-col">
              <span className="text-white/70 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5">
                {card.type} CARD {isVirtual && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
              </span>
              <span className="text-white text-lg font-bold tracking-tight font-headline-lg drop-shadow">FinEdge</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase border ${
                isVirtual 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-400/30' 
                  : 'text-primary bg-primary/10 border-primary/30'
              }`}>
                {card.tier || (isVirtual ? 'Virtual' : 'Standard')}
              </span>
            </div>
          </div>

          {/* Chip and Contactless */}
          <div className="flex items-center gap-3 relative z-20 my-1">
            {isVirtual ? (
              <div className="w-10 h-8 bg-gradient-to-br from-emerald-400 to-teal-700 rounded-[4px] relative overflow-hidden border border-emerald-300/40 flex items-center justify-center shadow-inner">
                <div className="w-4 h-4 rounded-full border border-white/60 animate-ping opacity-75"></div>
                <span className="text-[8px] font-bold text-slate-950 uppercase font-mono z-10">VIRT</span>
              </div>
            ) : (
              <div className="w-10 h-8 bg-gradient-to-br from-[#ffd700] to-[#b8860b] rounded-[4px] relative overflow-hidden border border-[#8b6508] shadow-inner">
                <div className="absolute inset-0 border border-white/20 rounded-[4px]"></div>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black/20"></div>
                <div className="absolute top-[20%] left-0 w-full h-[1px] bg-black/20"></div>
                <div className="absolute top-[80%] left-0 w-full h-[1px] bg-black/20"></div>
                <div className="absolute rounded-sm inset-1 border border-black/10"></div>
              </div>
            )}

            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
              <path d="M8.5 16.5a4.5 4.5 0 0 1 0-9"></path>
              <path d="M11.5 19.5a7.5 7.5 0 0 1 0-15"></path>
              <path d="M14.5 22.5a10.5 10.5 0 0 1 0-21"></path>
            </svg>
          </div>

          {/* Card Number */}
          <div className="relative z-20 flex items-center justify-between">
            <span className="font-mono text-xl tracking-[0.2em] text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {showDetails ? (card.fullNumber || card.cardNumber) : card.maskedNumber}
            </span>
          </div>

          {/* Bottom row: Name, Expiry, Logo */}
          <div className="flex justify-between items-end relative z-20">
            <div className="flex flex-col">
              <span className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5 font-medium">Card Holder</span>
              <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase truncate max-w-[140px] drop-shadow">
                {card.cardholderName || card.cardHolderName}
              </span>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5 font-medium">Expires</span>
              <span className="font-mono text-white text-xs sm:text-sm font-semibold tracking-wider drop-shadow">
                {card.expiry || card.expiryDate}
              </span>
            </div>
            <div className="w-12 flex justify-end">
              {card.network === 'VISA' ? (
                <svg viewBox="0 0 50 16" className="h-4 w-auto fill-white opacity-95 drop-shadow">
                  <path d="M22.04 15.68l3.15-9.87h5.11l-3.15 9.87h-5.11zm15.19-9.61c-1.02-.38-2.67-.81-4.71-.81-5.07 0-8.65 2.65-8.67 6.45-.02 2.81 2.55 4.38 4.49 5.32 1.99.95 2.66 1.57 2.66 2.42-.02 1.31-1.6 1.92-3.08 1.92-2.07 0-3.17-.32-4.88-1.09l-.68-.32-1.42 8.65c1.2.55 3.42 1.02 5.75 1.05 5.4 0 8.92-2.61 8.95-6.66.02-2.22-1.32-3.9-4.32-5.29-1.78-.88-2.88-1.46-2.88-2.36.02-1.18 1.34-1.85 3.01-1.85 1.63-.04 2.82.34 3.79.77l.46.22 1.48-8.59zm12.39 9.61h4.74l-4.14-9.87h-4.33c-1.04 0-1.82.29-2.27 1.32l-7.9 18.42h5.36l1.06-2.97h6.54l.6 2.97h5.35l-4.14-9.87z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 36 22" className="h-6 w-auto opacity-95 drop-shadow">
                  <circle cx="11" cy="11" r="11" fill="#EB001B"/>
                  <circle cx="25" cy="11" r="11" fill="#F79E1B"/>
                  <path d="M18 11c0-3.52 1.65-6.65 4.19-8.73-2.54 2.08-4.19 5.21-4.19 8.73s1.65 6.65 4.19 8.73C19.65 17.65 18 14.52 18 11z" fill="#FF5F00"/>
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* ==================== BACK FACE (Rendered only if enableFlip is true) ==================== */}
        {enableFlip && (
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl flex flex-col justify-between overflow-hidden border border-white/10 ${bgClass}`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Black Magnetic Stripe */}
            <div className="w-full h-11 bg-slate-950 mt-4 border-y border-white/10 relative flex items-center justify-end px-4">
              <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">FinEdge Secure Stripe</span>
            </div>

            {/* Signature Panel & CVV Box */}
            <div className="px-6 py-2">
              <div className="flex items-center gap-3">
                {/* Signature Strip */}
                <div className="flex-1 h-9 bg-slate-200/90 rounded flex items-center px-3 border border-white/30 overflow-hidden relative">
                  <span className="font-handwriting text-slate-800 text-sm font-semibold italic select-none">
                    {card.cardholderName || card.cardHolderName}
                  </span>
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.05)_4px,rgba(0,0,0,0.05)_8px)] pointer-events-none"></div>
                </div>

                {/* CVV Box */}
                <div className="w-16 h-9 bg-white rounded flex flex-col items-center justify-center border border-slate-300 shadow-inner">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">CVV</span>
                  <span className="font-mono text-slate-950 text-xs font-extrabold tracking-widest">
                    {showDetails ? card.cvv : '•••'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Security Info & Support Line */}
            <div className="px-6 pb-4 flex justify-between items-end text-white/60 text-[9px] leading-tight">
              <div>
                <p className="font-medium text-white/80">Authorized Signature • Not Transferable</p>
                <p className="text-[8px] text-white/40 mt-0.5">24/7 Support: 1800-123-999 (Toll Free)</p>
              </div>
              
              {/* Hologram Emblem */}
              <div className="w-9 h-7 rounded bg-gradient-to-tr from-amber-300 via-emerald-400 to-sky-400 opacity-80 flex items-center justify-center text-slate-950 font-bold text-[8px] shadow-sm border border-white/40">
                HOLOGRAM
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
