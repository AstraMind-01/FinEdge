"use client";
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CardsHeader from '../../components/cards/CardsHeader';
import CardsCarousel from '../../components/cards/CardsCarousel';
import CardDetailsPanel from '../../components/cards/CardDetailsPanel';
import CardControlsTabs from '../../components/cards/CardControlsTabs';
import CardsRightSidebar from '../../components/cards/CardsRightSidebar';
import AvailableCardTypes from '../../components/cards/AvailableCardTypes';
import { BankCard, CardOffer, CardControls } from '../../types';
import { MockApi } from '../../lib/mockApi';

import { AccountProvider } from '../../context/AccountContext';

export default function CardsPage() {
  const [cards, setCards] = useState<BankCard[]>([]);
  const [offers, setOffers] = useState<CardOffer[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCards, fetchedOffers] = await Promise.all([
          MockApi.getCards(),
          MockApi.getCardOffers()
        ]);
        setCards(fetchedCards);
        setOffers(fetchedOffers);
        if (fetchedCards.length > 0) {
          const defaultCard = fetchedCards.find((c: BankCard) => c.isDefault) || fetchedCards[0];
          setSelectedCardId(defaultCard.id);
        }
      } catch (error) {
        console.error("Error fetching cards data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusToggle = (newStatus: "ACTIVE" | "FROZEN") => {
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === selectedCardId ? { ...c, status: newStatus } : c
      )
    );
  };

  const handleUpdateControls = (newControls: CardControls) => {
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === selectedCardId ? { ...c, controls: newControls } : c
      )
    );
  };

  if (loading) {
    return (
      <AccountProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </AccountProvider>
    );
  }

  const selectedCard = cards.find(c => c.id === selectedCardId);

  return (
    <AccountProvider>
      <div className="flex min-h-screen bg-background text-on-surface">
        <Sidebar />
        <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
          <Header />
          
          <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
            <CardsHeader />
            
            {cards.length > 0 && selectedCard ? (
              <>
                <CardsCarousel 
                  cards={cards} 
                  selectedCardId={selectedCardId!} 
                  onSelectCard={setSelectedCardId} 
                />

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <CardDetailsPanel 
                      card={selectedCard} 
                      onStatusToggle={handleStatusToggle} 
                    />
                    <CardControlsTabs 
                      card={selectedCard}
                      onUpdateControls={handleUpdateControls}
                    />
                  </div>

                  {/* Right Sidebar */}
                  <CardsRightSidebar 
                    card={selectedCard} 
                    offers={offers} 
                  />
                </div>
              </>
            ) : (
              <div className="bg-surface-container-low rounded-2xl p-12 text-center border border-white/5">
                <p className="text-on-surface-variant">No cards found. Apply for a new card to get started.</p>
              </div>
            )}

            <AvailableCardTypes />
          </main>
        </div>
      </div>
    </AccountProvider>
  );
}
