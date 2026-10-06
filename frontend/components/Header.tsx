"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Mail, Maximize, Minimize, ChevronDown, X } from 'lucide-react';
import { useAccounts } from '../context/AccountContext';
import HeaderNotificationsDropdown from './header/HeaderNotificationsDropdown';
import HeaderInboxDropdown from './header/HeaderInboxDropdown';
import UserProfileDropdown from './header/UserProfileDropdown';
import GlobalSearchDropdown from './header/GlobalSearchDropdown';
import SupportChatModal from './modals/SupportChatModal';

export default function Header() {
  const { userProfile, accounts, transactions, selectAccount, notificationsCount, inboxCount } = useAccounts();
  const [activeDropdown, setActiveDropdown] = useState<"inbox" | "notifications" | "profile" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for custom open-support-chat events
  useEffect(() => {
    const handleSupportEvent = () => setIsSupportOpen(true);
    window.addEventListener("open-support-chat", handleSupportEvent);
    return () => window.removeEventListener("open-support-chat", handleSupportEvent);
  }, []);

  const toggleDropdown = (type: "inbox" | "notifications" | "profile") => {
    setActiveDropdown(prev => prev === type ? null : type);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <>
      <header className="h-[72px] bg-surface-container/80 backdrop-blur-md border-b border-outline-variant/10 flex items-center justify-between px-6 fixed top-0 right-0 left-0 lg:left-[230px] z-30 transition-all duration-300">
        
        {/* Left: Global Search Input */}
        <div className="relative flex-1 max-w-lg">
          <div className="relative flex items-center">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search transactions, accounts, payees, services..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                setIsSearchOpen(true);
              }}
              className="w-full bg-surface-high/60 border border-outline-variant/20 rounded-xl py-2 pl-10 pr-16 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />

            {/* Right inside Search input: Clear button OR Ctrl+K badge */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-on-surface-variant/70 bg-surface-container/80 rounded border border-outline-variant/30 select-none">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          <GlobalSearchDropdown 
            isOpen={isSearchOpen}
            query={searchQuery}
            accounts={accounts}
            transactions={transactions}
            onSelectAccount={selectAccount}
            onOpenSupport={() => setIsSupportOpen(true)}
            onClose={() => setIsSearchOpen(false)}
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-5 text-on-surface-variant">
            
            {/* Mail Inbox Button */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown("inbox")}
                className="p-1 hover:text-on-surface transition-colors relative"
                title="Secure Inbox"
              >
                <Mail size={20} />
                {inboxCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">
                    {inboxCount}
                  </span>
                )}
              </button>

              <HeaderInboxDropdown 
                isOpen={activeDropdown === "inbox"} 
                onClose={() => setActiveDropdown(null)} 
              />
            </div>

            {/* Notifications Bell Button */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown("notifications")}
                className="p-1 hover:text-on-surface transition-colors relative"
                title="Notifications"
              >
                <Bell size={20} />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-tertiary text-on-tertiary text-[9px] font-bold rounded-full flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
              </button>

              <HeaderNotificationsDropdown 
                isOpen={activeDropdown === "notifications"} 
                onClose={() => setActiveDropdown(null)} 
              />
            </div>

            {/* Fullscreen Toggle */}
            <button 
              onClick={toggleFullscreen} 
              className="p-1 hover:text-on-surface transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>

          <div className="h-6 w-px bg-outline-variant/20 hidden sm:block"></div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown("profile")}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-surface-high/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-surface-high border border-outline-variant/30 flex items-center justify-center font-bold text-sm text-primary overflow-hidden shrink-0">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  userProfile.name.charAt(0)
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-on-surface">{userProfile.name}</span>
                <span className="text-[10px] text-on-surface-variant font-mono">ID: {userProfile.customerID}</span>
              </div>
              <ChevronDown size={14} className="text-on-surface-variant" />
            </button>

            <UserProfileDropdown 
              isOpen={activeDropdown === "profile"} 
              onClose={() => setActiveDropdown(null)} 
            />
          </div>

        </div>

      </header>

      {/* Global Support Chat Modal */}
      <SupportChatModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
}
