"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import FilterBar from '../../components/notifications/FilterBar';
import NotificationsList, { Notification } from '../../components/notifications/NotificationsList';
import NotificationSidebar from '../../components/notifications/NotificationSidebar';
import NotificationSettingsModal from '../../components/modals/NotificationSettingsModal';
import { Settings, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const {
    isLoading,
    unreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    getFilteredNotifications
  } = useNotifications();

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const filteredNotifications = getFilteredNotifications(activeTab, searchQuery);

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
        <Header />
        <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] md:text-[32px] font-headline-lg font-bold text-on-surface leading-tight">
                Notifications
              </h1>
              <p className="text-[14px] text-on-surface-variant mt-1">
                Stay updated on your account activity
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 text-[13px] font-medium text-primary hover:text-primary-fixed transition-colors cursor-pointer"
                >
                  <CheckCheck size={16} />
                  Mark All as Read
                </button>
              )}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-white/15 text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
              >
                <Settings size={16} />
                Notification Settings
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            unreadCount={unreadCount}
          />

          {/* Main content + right sidebar */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Notifications List */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-24 bg-surface-container-low rounded-xl border border-white/5">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <NotificationsList 
                  notifications={filteredNotifications as Notification[]}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              )}
            </div>

            {/* Right Sidebar */}
            <NotificationSidebar />
          </div>

        </main>
      </div>

      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
