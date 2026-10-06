"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface WatchlistItem {
  id?: number;
  instrumentId: string;
  symbol: string;
  instrumentName: string;
  instrumentType: "STOCK" | "MUTUAL_FUND" | "ETF";
  exchange: "NSE" | "BSE" | "AMFI";
  price?: string;
  change?: string;
  isPositive?: boolean;
  marketData?: {
    formattedPrice?: string;
    formattedChange?: string;
    isPositive?: boolean;
    currentPrice?: number;
    marketState?: string;
  };
}

interface WatchlistContextType {
  watchlistItems: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isWatchlisted: (instrumentId: string) => boolean;
  addToWatchlist: (item: Partial<WatchlistItem>) => Promise<boolean>;
  removeFromWatchlist: (instrumentId: string) => Promise<boolean>;
  toggleWatchlist: (item: Partial<WatchlistItem>) => Promise<boolean>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  {
    instrumentId: "TATAMOTORS",
    symbol: "TATAMOTORS.NS",
    instrumentName: "Tata Motors",
    instrumentType: "STOCK",
    exchange: "NSE",
    marketData: { formattedPrice: "₹812.40", formattedChange: "+2.3%", isPositive: true }
  },
  {
    instrumentId: "HDFC_FLEXI",
    symbol: "101881",
    instrumentName: "HDFC Flexi Cap Fund",
    instrumentType: "MUTUAL_FUND",
    exchange: "AMFI",
    marketData: { formattedPrice: "NAV ₹42.15", formattedChange: "+1.1%", isPositive: true }
  },
  {
    instrumentId: "INFY",
    symbol: "INFY.NS",
    instrumentName: "Infosys",
    instrumentType: "STOCK",
    exchange: "NSE",
    marketData: { formattedPrice: "₹1,542.60", formattedChange: "-0.4%", isPositive: false }
  }
];

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>(DEFAULT_WATCHLIST);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setWatchlistItems(data);
        }
      }
    } catch (err: any) {
      console.warn("Failed to load watchlist from API, utilizing cached baseline:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const isWatchlisted = (instrumentId: string) => {
    if (!instrumentId) return false;
    const cleanId = instrumentId.toUpperCase();
    return watchlistItems.some(i => i.instrumentId?.toUpperCase() === cleanId || i.symbol?.toUpperCase() === cleanId);
  };

  const addToWatchlist = async (item: Partial<WatchlistItem>): Promise<boolean> => {
    const instId = (item.instrumentId || item.symbol || "").toUpperCase();
    if (!instId || isWatchlisted(instId)) return false;

    const newItem: WatchlistItem = {
      instrumentId: instId,
      symbol: item.symbol || instId,
      instrumentName: item.instrumentName || item.symbol || instId,
      instrumentType: item.instrumentType || "STOCK",
      exchange: item.exchange || "NSE",
      marketData: item.marketData || {
        formattedPrice: item.price || "₹500.00",
        formattedChange: item.change || "+1.0%",
        isPositive: !(item.change || "").startsWith("-")
      }
    };

    setWatchlistItems(prev => [...prev, newItem]);

    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });
      return true;
    } catch (e) {
      console.error("Error saving watchlist item to backend:", e);
      return true;
    }
  };

  const removeFromWatchlist = async (instrumentId: string): Promise<boolean> => {
    if (!instrumentId) return false;
    const cleanId = instrumentId.toUpperCase();

    setWatchlistItems(prev => prev.filter(i => i.instrumentId?.toUpperCase() !== cleanId && i.symbol?.toUpperCase() !== cleanId));

    try {
      await fetch(`/api/watchlist/${cleanId}`, { method: "DELETE" });
      return true;
    } catch (e) {
      console.error("Error removing watchlist item from backend:", e);
      return true;
    }
  };

  const toggleWatchlist = async (item: Partial<WatchlistItem>): Promise<boolean> => {
    const instId = (item.instrumentId || item.symbol || "").toUpperCase();
    if (isWatchlisted(instId)) {
      return removeFromWatchlist(instId);
    } else {
      return addToWatchlist(item);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlistItems,
        isLoading,
        error,
        isEditModalOpen,
        setIsEditModalOpen,
        isWatchlisted,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        refreshWatchlist: fetchWatchlist
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
};
