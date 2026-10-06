import { useState, useEffect } from "react";
import { AppNotification, AppInboxMessage } from "./types";
import { resolveNotificationMetadata } from "./notificationHelper";

export function useAccountMessaging(addPageNotification: (meta: any) => void) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [inboxMessages, setInboxMessages] = useState<AppInboxMessage[]>([]);

  useEffect(() => {
    try {
      const savedNotifs = localStorage.getItem("finedge_user_notifications");
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
      const savedInbox = localStorage.getItem("finedge_user_inbox");
      if (savedInbox) {
        setInboxMessages(JSON.parse(savedInbox));
      }
    } catch {}
  }, []);

  const saveNotificationsState = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem("finedge_user_notifications", JSON.stringify(newNotifs));
    } catch {}
  };

  const saveInboxState = (newInbox: AppInboxMessage[]) => {
    setInboxMessages(newInbox);
    try {
      localStorage.setItem("finedge_user_inbox", JSON.stringify(newInbox));
    } catch {}
  };

  const addNotification = (title: string, subtitle: string, type: AppNotification["type"] = "SYSTEM") => {
    const newNotif: AppNotification = {
      id: `NOT-${Date.now()}`,
      title,
      subtitle,
      timeAgo: "Just now",
      unread: true,
      type,
    };
    saveNotificationsState([newNotif, ...notifications]);

    const meta = resolveNotificationMetadata(title, subtitle, type);
    addPageNotification(meta);
  };

  const addInboxMessage = (sender: string, subject: string, content: string) => {
    const newMsg: AppInboxMessage = {
      id: `MSG-${Date.now()}`,
      sender,
      subject,
      timeAgo: "Just now",
      read: false,
      content,
    };
    saveInboxState([newMsg, ...inboxMessages]);
  };

  const markNotificationRead = (id: string) => {
    saveNotificationsState(notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllNotificationsRead = () => {
    saveNotificationsState(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markInboxRead = (id: string) => {
    saveInboxState(inboxMessages.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const markAllInboxRead = () => {
    saveInboxState(inboxMessages.map((m) => ({ ...m, read: true })));
  };

  const deleteInboxMessage = (id: string) => {
    saveInboxState(inboxMessages.filter((m) => m.id !== id));
  };

  const notificationsCount = notifications.filter((n) => n.unread).length;
  const inboxCount = inboxMessages.filter((m) => !m.read).length;

  return {
    notifications,
    notificationsCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    inboxMessages,
    inboxCount,
    addInboxMessage,
    markInboxRead,
    markAllInboxRead,
    deleteInboxMessage,
  };
}
