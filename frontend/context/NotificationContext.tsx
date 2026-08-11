"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface FullNotification {
  id: string;
  type: 'transaction' | 'approval' | 'security' | 'update' | 'offer';
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
  dateGroup: 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  actionLink?: string;
  actionLabel?: string;
  referenceId?: string;
  sourceEvent?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  transactions: boolean;
  security: boolean;
  promotions: boolean;
  reminders: boolean;
}

export interface DNDSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface NotificationContextType {
  notifications: FullNotification[];
  unreadCount: number;
  isLoading: boolean;
  preferences: NotificationPreferences;
  dndSettings: DNDSettings;

  addNotification: (data: Omit<FullNotification, 'id' | 'timestamp' | 'createdAt' | 'dateGroup' | 'isRead'> & { id?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getFilteredNotifications: (filter: string, search: string) => FullNotification[];
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  updateDND: (settings: Partial<DNDSettings>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ─── Helpers ────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  NOTIFICATIONS: "finedge_page_notifications",
  PREFERENCES: "finedge_notification_prefs",
  DND: "finedge_dnd_settings",
  EVENTS: "finedge_notification_events",
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  push: true,
  email: false,
  sms: true,
  transactions: true,
  security: true,
  promotions: false,
  reminders: true,
};

const DEFAULT_DND: DNDSettings = {
  enabled: false,
  startTime: "22:00",
  endTime: "07:00",
};

function computeDateGroup(createdAt: string): 'Today' | 'Yesterday' | 'This Week' | 'Earlier' {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isToday = now.toDateString() === created.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === created.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  if (diffDays <= 7) return 'This Week';
  return 'Earlier';
}

function computeRelativeTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[created.getDay()];
    const date = created.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day}, ${date} ${months[created.getMonth()]}`;
  }
  const date = created.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date} ${months[created.getMonth()]} ${created.getFullYear()}`;
}

function isTimeInDND(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = startTime.split(':').map(s => parseInt(s || '0', 10));
  const [eh, em] = endTime.split(':').map(s => parseInt(s || '0', 10));
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight DND (e.g. 22:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// ─── Provider ───────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<FullNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [dndSettings, setDndSettings] = useState<DNDSettings>(DEFAULT_DND);
  const [isLoading, setIsLoading] = useState(true);
  const processedEventsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    const storedNotifs = loadFromStorage<FullNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const storedPrefs = loadFromStorage<NotificationPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
    const storedDND = loadFromStorage<DNDSettings>(STORAGE_KEYS.DND, DEFAULT_DND);
    const storedEvents = loadFromStorage<string[]>(STORAGE_KEYS.EVENTS, []);

    // Recompute date groups and timestamps for existing notifications
    const refreshedNotifs = storedNotifs.map(n => ({
      ...n,
      dateGroup: computeDateGroup(n.createdAt),
      timestamp: computeRelativeTime(n.createdAt),
    }));

    setNotifications(refreshedNotifs);
    setPreferences(storedPrefs);
    setDndSettings(storedDND);
    processedEventsRef.current = new Set(storedEvents);
    isInitializedRef.current = true;
    setIsLoading(false);

    // Attempt to sync with backend notification service
    syncWithBackend(refreshedNotifs);
  }, []);

  // Persist notifications whenever they change (but only after initialization)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  // Refresh relative timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.map(n => ({
        ...n,
        dateGroup: computeDateGroup(n.createdAt),
        timestamp: computeRelativeTime(n.createdAt),
      })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const syncWithBackend = async (currentNotifs: FullNotification[]) => {
    try {
      const res = await fetch("/api/notifications", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications) && data.notifications.length > 0) {
          // Merge backend notifications with local ones (deduplicate by sourceEvent)
          const localEvents = new Set(currentNotifs.map(n => n.sourceEvent).filter(Boolean));
          const newFromBackend = data.notifications.filter(
            (n: FullNotification) => n.sourceEvent && !localEvents.has(n.sourceEvent)
          );
          if (newFromBackend.length > 0) {
            setNotifications(prev => [...newFromBackend, ...prev]);
          }
        }
      }
    } catch (e) {
      // Backend unavailable — continue with localStorage data
    }
  };

  const addNotification = useCallback((data: Omit<FullNotification, 'id' | 'timestamp' | 'createdAt' | 'dateGroup' | 'isRead'> & { id?: string }) => {
    // Idempotency check: if sourceEvent is provided, skip duplicates
    if (data.sourceEvent) {
      if (processedEventsRef.current.has(data.sourceEvent)) {
        return;
      }
      processedEventsRef.current.add(data.sourceEvent);
      // Persist processed events
      saveToStorage(STORAGE_KEYS.EVENTS, Array.from(processedEventsRef.current));
    }

    // Check if category is enabled in preferences
    const categoryCheck = getCategoryForType(data.type);
    const prefsRef = loadFromStorage<NotificationPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
    if (categoryCheck === 'transactions' && !prefsRef.transactions) return;
    if (categoryCheck === 'security' && !prefsRef.security) return;
    if (categoryCheck === 'promotions' && !prefsRef.promotions) return;
    if (categoryCheck === 'reminders' && !prefsRef.reminders) return;

    // Check Do Not Disturb (DND) window settings:
    // Mute all non-urgent notifications during DND period, but allow critical security alerts through
    const dndRef = loadFromStorage<DNDSettings>(STORAGE_KEYS.DND, DEFAULT_DND);
    if (dndRef.enabled && isTimeInDND(dndRef.startTime, dndRef.endTime)) {
      const isCriticalSecurity = data.priority === 'critical' || data.type === 'security';
      if (!isCriticalSecurity) {
        return; // Suppress non-critical notification during DND
      }
    }

    const now = new Date().toISOString();
    const newNotification: FullNotification = {
      ...data,
      id: data.id || `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: "Just now",
      createdAt: now,
      dateGroup: 'Today',
      isRead: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep last 200 notifications to prevent unbounded growth
      return updated.slice(0, 200);
    });

    // Attempt to persist to backend
    try {
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotification),
      }).catch(() => {});
    } catch (e) {}
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      fetch(`/api/notifications/${id}`, { method: "PATCH" }).catch(() => {});
    } catch (e) {}
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      fetch("/api/notifications/read-all", { method: "PATCH" }).catch(() => {});
    } catch (e) {}
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      fetch(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => {});
    } catch (e) {}
  }, []);

  const getFilteredNotifications = useCallback((filter: string, search: string): FullNotification[] => {
    return notifications.filter(n => {
      const matchesSearch = !search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = (() => {
        switch (filter) {
          case 'unread': return !n.isRead;
          case 'transactions': return n.type === 'transaction';
          case 'security': return n.type === 'security';
          case 'approvals': return n.type === 'approval';
          case 'offers': return n.type === 'offer' || n.type === 'update';
          default: return true;
        }
      })();

      return matchesSearch && matchesFilter;
    });
  }, [notifications]);

  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...prefs };
      saveToStorage(STORAGE_KEYS.PREFERENCES, updated);
      // Attempt to persist to backend
      try {
        fetch("/api/notifications/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: updated }),
        }).catch(() => {});
      } catch (e) {}
      return updated;
    });
  }, []);

  const updateDND = useCallback((settings: Partial<DNDSettings>) => {
    setDndSettings(prev => {
      const updated = { ...prev, ...settings };
      saveToStorage(STORAGE_KEYS.DND, updated);
      try {
        fetch("/api/notifications/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dnd: updated }),
        }).catch(() => {});
      } catch (e) {}
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    preferences,
    dndSettings,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getFilteredNotifications,
    updatePreferences,
    updateDND,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// ─── Utility: Map AccountContext types to notification page types ────────────

function getCategoryForType(type: FullNotification['type']): string {
  switch (type) {
    case 'transaction': return 'transactions';
    case 'security': return 'security';
    case 'approval': return 'transactions';
    case 'offer': return 'promotions';
    case 'update': return 'reminders';
    default: return 'transactions';
  }
}

export function mapAppNotificationType(appType: string): FullNotification['type'] {
  switch (appType) {
    case 'DEBIT':
    case 'CREDIT':
      return 'transaction';
    case 'SECURITY':
      return 'security';
    case 'LOAN':
      return 'approval';
    case 'CARD':
      return 'update';
    case 'SYSTEM':
    default:
      return 'update';
  }
}

export function mapPriority(appType: string): FullNotification['priority'] {
  switch (appType) {
    case 'SECURITY': return 'critical';
    case 'DEBIT': return 'high';
    case 'CREDIT': return 'medium';
    case 'LOAN': return 'medium';
    case 'CARD': return 'medium';
    case 'SYSTEM':
    default: return 'low';
  }
}
