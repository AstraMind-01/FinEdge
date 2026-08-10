"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import FilterBar from '../../components/notifications/FilterBar';
import NotificationsList, { Notification } from '../../components/notifications/NotificationsList';
import NotificationSidebar from '../../components/notifications/NotificationSidebar';
import { Settings, CheckCheck } from 'lucide-react';

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'transaction',
    title: 'Transaction Alert',
    description: '₹15,000 debited to Rahul Kumar from your Savings Account ••••2840.',
    timestamp: '2 mins ago',
    isRead: false,
    dateGroup: 'Today',
  },
  {
    id: '2',
    type: 'update',
    title: 'EMI Reminder',
    description: 'Your Home Loan EMI of ₹23,500 is due on 15th August 2026. Avoid late fees.',
    timestamp: '1 hour ago',
    isRead: false,
    dateGroup: 'Today',
    action: {
      label: 'Pay Now',
      onClick: () => alert('Redirecting to payment...'),
    },
  },
  {
    id: '3',
    type: 'security',
    title: 'Security Alert',
    description: 'A new login was detected on Chrome, MacOS from Mumbai, India. Not you? Secure your account now.',
    timestamp: '3 hours ago',
    isRead: false,
    dateGroup: 'Today',
    action: {
      label: 'Review Activity',
      onClick: () => alert('Redirecting to security center...'),
    },
  },
  {
    id: '4',
    type: 'approval',
    title: 'Beneficiary Approval Needed',
    description: 'New beneficiary Priya Sharma (HDFC ••••9987) has been added. Approval required before first transfer.',
    timestamp: '5 hours ago',
    isRead: false,
    dateGroup: 'Today',
    action: {
      label: 'Approve',
      onClick: () => alert('Approving beneficiary...'),
    },
  },
  {
    id: '5',
    type: 'update',
    title: 'KYC Update Reminder',
    description: 'Your KYC documents are due for renewal. Please update your Aadhaar and PAN details by 31st August.',
    timestamp: '8 hours ago',
    isRead: false,
    dateGroup: 'Today',
  },
  {
    id: '6',
    type: 'approval',
    title: 'Loan Approved',
    description: 'Congratulations! Your Personal Loan application of ₹5,00,000 has been approved. Amount disbursed.',
    timestamp: 'Yesterday, 10:30 AM',
    isRead: true,
    dateGroup: 'Yesterday',
  },
  {
    id: '7',
    type: 'update',
    title: 'Card Expiry Warning',
    description: 'Your FinEdge Platinum Debit Card ••••5412 is expiring on 31st Aug 2026. Request a replacement now.',
    timestamp: 'Yesterday, 3:15 PM',
    isRead: true,
    dateGroup: 'Yesterday',
  },
  {
    id: '8',
    type: 'transaction',
    title: 'Fund Transfer Confirmed',
    description: '₹8,500 successfully transferred to Ankit Sharma (SBI ••••3210). Reference No: TXN289400011.',
    timestamp: 'Yesterday, 6:00 PM',
    isRead: true,
    dateGroup: 'Yesterday',
  },
  {
    id: '9',
    type: 'approval',
    title: 'Fixed Deposit Matured',
    description: 'Your Fixed Deposit of ₹1,00,000 has matured. ₹1,08,500 (including ₹8,500 interest) credited to your account.',
    timestamp: 'Mon, 7 Aug',
    isRead: true,
    dateGroup: 'This Week',
  },
  {
    id: '10',
    type: 'offer',
    title: 'Exclusive Cashback Offer!',
    description: 'Get 10% cashback (up to ₹500) on your next 3 utility bill payments with FinEdge UPI. Valid till 20th Aug.',
    timestamp: 'Sat, 5 Aug',
    isRead: true,
    dateGroup: 'Earlier',
  },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = !searchQuery || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = (() => {
      switch (activeTab) {
        case 'unread': return !n.isRead;
        case 'transactions': return n.type === 'transaction';
        case 'security': return n.type === 'security';
        case 'approvals': return n.type === 'approval';
        case 'offers': return n.type === 'offer';
        default: return true;
      }
    })();

    return matchesSearch && matchesTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
                  className="flex items-center gap-2 text-[13px] font-medium text-primary hover:text-primary-fixed transition-colors"
                >
                  <CheckCheck size={16} />
                  Mark All as Read
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2.5 border border-white/15 text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all">
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
              <NotificationsList 
                notifications={filteredNotifications}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            </div>

            {/* Right Sidebar */}
            <NotificationSidebar />
          </div>

        </main>
      </div>
    </div>
  );
}
