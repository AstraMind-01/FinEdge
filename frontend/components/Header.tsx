"use client";

import React, { useState, useEffect } from 'react';
import { Search, Mail, Bell, Maximize, Minimize } from 'lucide-react';
import { useAccounts } from '../context/AccountContext';
import HeaderInboxDropdown from './header/HeaderInboxDropdown';
import HeaderNotificationsDropdown from './header/HeaderNotificationsDropdown';
import UserProfileDropdown from './header/UserProfileDropdown';
import GlobalSearchDropdown from './header/GlobalSearchDropdown';

export default function Header() {
  const { userProfile, accounts, transactions, selectAccount, notificationsCount } = useAccounts();
  const [activeDropdown, setActiveDropdown] = useState<"inbox" | "notifications" | "profile" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const toggleDropdown = (name: "inbox" | "notifications" | "profile") => {
    setActiveDropdown(prev => prev === name ? null : name);
    setIsSearchOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-[230px] right-0 h-[72px] bg-background/95 backdrop-blur-xl z-40 px-6 lg:px-8 flex items-center justify-between border-b border-outline-variant/10 shadow-[0_1px_8px_rgba(0,0,0,0.1)]">
      {/* Left Greeting & Search */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-headline-lg text-[18px] lg:text-[20px] font-semibold text-on-surface leading-tight">Welcome back, {userProfile.name}</span>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Premium</span>
          </div>
          <span className="text-[12px] text-on-surface-variant mt-0.5">Managing your wealth securely.</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative ml-8 hidden lg:block">
          <div className="flex items-center bg-surface-container rounded-full px-4 py-2 gap-2 border border-outline-variant/20 w-[240px] xl:w-[300px]">
            <Search className="text-on-surface-variant shrink-0" size={18} />
            <input 
              className="bg-transparent border-none outline-none text-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant w-full" 
              placeholder="Search transactions..." 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
          </div>

          <GlobalSearchDropdown
            query={searchQuery}
            accounts={accounts}
            transactions={transactions}
            isOpen={isSearchOpen && searchQuery.trim().length > 0}
            onClose={() => setIsSearchOpen(false)}
            onSelectAccount={selectAccount}
          />
        </div>
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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
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

        <div className="hidden sm:block h-8 w-[1px] bg-outline-variant/30"></div>

        {/* User Profile Area */}
        <div className="relative">
          <div 
            onClick={() => toggleDropdown("profile")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold text-on-surface leading-tight truncate max-w-[120px] group-hover:text-primary transition-colors">{userProfile.name}</p>
              <p className="text-[11px] text-primary leading-tight mt-0.5">Premium Member</p>
            </div>
            <img 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary shrink-0 transition-colors shadow-sm" 
              src={userProfile.avatarUrl}
            />
          </div>

          <UserProfileDropdown 
            isOpen={activeDropdown === "profile"} 
            onClose={() => setActiveDropdown(null)} 
          />
        </div>
      </div>
    </header>
  );
}
