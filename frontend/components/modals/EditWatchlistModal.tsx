"use client";

import React, { useState } from "react";
import { X, Eye, PlusCircle, Trash2, Search, Check, TrendingUp, Sparkles } from "lucide-react";
import { useWatchlist, WatchlistItem } from "../../context/WatchlistContext";

interface EditWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_INSTRUMENTS: Partial<WatchlistItem>[] = [
  { instrumentId: "TATAMOTORS", symbol: "TATAMOTORS.NS", instrumentName: "Tata Motors", instrumentType: "STOCK", exchange: "NSE", marketData: { formattedPrice: "₹812.40", formattedChange: "+2.3%", isPositive: true } },
  { instrumentId: "HDFC_FLEXI", symbol: "101881", instrumentName: "HDFC Flexi Cap Fund", instrumentType: "MUTUAL_FUND", exchange: "AMFI", marketData: { formattedPrice: "NAV ₹42.15", formattedChange: "+1.1%", isPositive: true } },
  { instrumentId: "INFY", symbol: "INFY.NS", instrumentName: "Infosys", instrumentType: "STOCK", exchange: "NSE", marketData: { formattedPrice: "₹1,542.60", formattedChange: "-0.4%", isPositive: false } },
  { instrumentId: "RELIANCE", symbol: "RELIANCE.NS", instrumentName: "Reliance Industries", instrumentType: "STOCK", exchange: "NSE", marketData: { formattedPrice: "₹2,980.50", formattedChange: "+1.5%", isPositive: true } },
  { instrumentId: "TCS", symbol: "TCS.NS", instrumentName: "Tata Consultancy Services", instrumentType: "STOCK", exchange: "NSE", marketData: { formattedPrice: "₹4,120.00", formattedChange: "+0.8%", isPositive: true } },
  { instrumentId: "ICICIBANK", symbol: "ICICIBANK.NS", instrumentName: "ICICI Bank", instrumentType: "STOCK", exchange: "NSE", marketData: { formattedPrice: "₹1,120.00", formattedChange: "+1.2%", isPositive: true } },
  { instrumentId: "SBIN", symbol: "SBIN.NS", instrumentName: "State Bank of India", instrumentType: "STOCK", exchange: "NSE", marketData: { formattedPrice: "₹825.10", formattedChange: "+0.6%", isPositive: true } },
  { instrumentId: "BLUECHIP", symbol: "120503", instrumentName: "FinEdge Bluechip Equity Fund", instrumentType: "MUTUAL_FUND", exchange: "AMFI", marketData: { formattedPrice: "NAV ₹56.40", formattedChange: "+1.8%", isPositive: true } },
  { instrumentId: "TAXSAVER", symbol: "101882", instrumentName: "FinEdge Tax Saver ELSS Fund", instrumentType: "MUTUAL_FUND", exchange: "AMFI", marketData: { formattedPrice: "NAV ₹38.90", formattedChange: "+0.9%", isPositive: true } },
  { instrumentId: "SMALLCAP", symbol: "119598", instrumentName: "FinEdge Small Cap High Alpha", instrumentType: "MUTUAL_FUND", exchange: "AMFI", marketData: { formattedPrice: "NAV ₹68.20", formattedChange: "+2.7%", isPositive: true } }
];

export default function EditWatchlistModal({ isOpen, onClose }: EditWatchlistModalProps) {
  const { watchlistItems, isWatchlisted, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredAvailable = AVAILABLE_INSTRUMENTS.filter(inst =>
    inst.instrumentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.instrumentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6 animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl z-[10060] my-auto flex flex-col gap-5 text-on-surface max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary flex items-center justify-center border border-primary/20">
              <Eye size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg m-0">Manage Watchlist</h2>
              <p className="text-xs text-on-surface-variant mt-0.5 m-0">Synchronized PostgreSQL persistence across FinEdge</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks or mutual funds to add (e.g. Reliance, TCS)..."
            className="w-full bg-surface-high border border-outline-variant/20 rounded-xl py-3 pl-10 pr-4 text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
          />
        </div>

        {/* Saved Watchlist Section */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider text-primary">
            Saved Instruments ({watchlistItems.length})
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {watchlistItems.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic py-3 text-center">Your watchlist is currently empty.</p>
            ) : (
              watchlistItems.map((w) => {
                const priceStr = w.marketData?.formattedPrice || w.price || "₹500.00";
                const changeStr = w.marketData?.formattedChange || w.change || "+0.0%";
                const isPos = w.marketData?.isPositive ?? !changeStr.startsWith("-");

                return (
                  <div key={w.instrumentId} className="flex items-center justify-between p-3 rounded-xl bg-surface-high/60 border border-outline-variant/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-on-surface text-xs font-bold m-0">{w.instrumentName}</p>
                      <span className="text-on-surface-variant text-[11px] font-mono">{priceStr}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold font-mono ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                        {changeStr}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromWatchlist(w.instrumentId)}
                        className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove from Watchlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Available Market Instruments */}
        <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider text-on-surface-variant">
            Discover Market Instruments
          </h3>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {filteredAvailable.map((inst) => {
              const watched = isWatchlisted(inst.instrumentId!);
              const priceStr = inst.marketData?.formattedPrice || "₹500.00";
              const changeStr = inst.marketData?.formattedChange || "+0.0%";
              const isPos = inst.marketData?.isPositive ?? true;

              return (
                <div key={inst.instrumentId} className="flex items-center justify-between p-3 rounded-xl bg-surface-high/30 border border-outline-variant/10 hover:bg-surface-high/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-on-surface text-xs font-bold m-0">{inst.instrumentName}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface border border-outline-variant/20 font-mono text-on-surface-variant">
                        {inst.exchange}
                      </span>
                    </div>
                    <span className="text-on-surface-variant text-[11px] font-mono">{priceStr}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold font-mono ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                      {changeStr}
                    </span>
                    {watched ? (
                      <span className="px-2 py-1 bg-tertiary/10 text-tertiary font-bold text-[10px] rounded-lg border border-tertiary/20 flex items-center gap-1">
                        <Check size={12} /> Saved
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToWatchlist(inst)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                      >
                        <PlusCircle size={16} /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
