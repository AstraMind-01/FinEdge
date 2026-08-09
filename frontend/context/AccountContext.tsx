"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Transaction, VerificationState, UserProfile } from "../types";
import { MockApi } from "../lib/mockApi";

export interface AppNotification {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  unread: boolean;
  type: "DEBIT" | "CREDIT" | "LOAN" | "SECURITY" | "CARD" | "SYSTEM";
}

export interface AppInboxMessage {
  id: string;
  sender: string;
  subject: string;
  timeAgo: string;
  read: boolean;
  content: string;
}

interface AccountContextType {
  userProfile: UserProfile;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  accounts: Account[];
  totalBalance: number;
  verificationStates: Record<string, VerificationState>;
  selectedAccountId: string | null;
  transactions: Transaction[];
  isLoading: boolean;
  
  // Notification Stream
  notifications: AppNotification[];
  notificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, subtitle: string, type?: AppNotification["type"]) => void;

  // Secure Bank Inbox Stream
  inboxMessages: AppInboxMessage[];
  inboxCount: number;
  markInboxRead: (id: string) => void;
  markAllInboxRead: () => void;
  deleteInboxMessage: (id: string) => void;
  addInboxMessage: (sender: string, subject: string, content: string) => void;

  refreshAllData: () => Promise<void>;
  selectAccount: (id: string) => void;
  requestVerification: (id: string) => void;
  verifyAccount: (id: string) => Promise<boolean>;
  hideBalance: (id: string) => void;
  executeTransfer: (from: string, to: string, amount: number) => Promise<void>;
  updateAccountLimits: (accountId: string, daily: number, transaction: number, atm: number) => Promise<void>;
  toggleAccountFreeze: (accountId: string) => Promise<void>;
  payBill: (accountId: string, billerName: string, category: string, amount: number) => Promise<void>;
  rechargeMobile: (accountId: string, mobileNumber: string, operator: string, amount: number) => Promise<void>;
  createFixedDeposit: (sourceAccountId: string, amount: number, tenureMonths: number, interestRate: number) => Promise<Account>;
  investMutualFund: (accountId: string, fundName: string, amount: number, isSip: boolean) => Promise<void>;
  pendingApprovals: { id: string; type: "BENEFICIARY" | "LOAN" | "HIGH_VALUE_TRANSFER"; title: string; subtitle: string; timeAgo: string; amount?: number; accountId?: string }[];
  approvePendingItem: (id: string, actionType: "APPROVE_BENEFICIARY" | "APPROVE_LOAN" | "VERIFY_OTP", payload?: any) => Promise<void>;
  cancelVerification: (id: string) => void;
  isTotalBalanceHidden: boolean;
  toggleTotalBalanceVisibility: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Soumya Ranjan",
    email: "soumya@finedge.bank",
    phone: "+91 98765 43210",
    address: "402, Skyline Towers, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051",
    branch: "Mumbai Corporate",
    avatarUrl: "https://lh3.googleusercontent.com/aida/AP1WRLsSwZ4DjkxkSDZcZiAFoC9WKVvWBd8YATVOK-aK4N5vTMk-Tk_6V8WlDvdomJ6bYe3HBp3PNJ57I_UT61tstMRF7kFhOemD1si94bMRwOkkiJtzmqqVRoT-zrcdNLikddEewBScNfE0KSklZnZdxG8S9jZVhAjVQHsJTFgrR9hBngkx66hTESe8CD9gV0WcYBEfci5hir_QikVnOaQyKCE_F5dZy8foopgH73duZTbFG4POtZ2DI7uiZIE",
    customerID: "FE9842",
    kycStatus: "Fully Verified",
    memberSince: "Oct 2021"
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verificationStates, setVerificationStates] = useState<Record<string, VerificationState>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTotalBalanceHidden, setIsTotalBalanceHidden] = useState(false);

  // Dynamic Notification Stream (Empty by default)
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Dynamic Bank Inbox Stream (Empty by default)
  const [inboxMessages, setInboxMessages] = useState<AppInboxMessage[]>([]);

  // Load persisted notifications and inbox on mount
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
    } catch (e) {}
  }, []);

  const saveNotificationsState = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem("finedge_user_notifications", JSON.stringify(newNotifs));
    } catch (e) {}
  };

  const saveInboxState = (newInbox: AppInboxMessage[]) => {
    setInboxMessages(newInbox);
    try {
      localStorage.setItem("finedge_user_inbox", JSON.stringify(newInbox));
    } catch (e) {}
  };

  const addNotification = (title: string, subtitle: string, type: AppNotification["type"] = "SYSTEM") => {
    const newNotif: AppNotification = {
      id: `NOT-${Date.now()}`,
      title,
      subtitle,
      timeAgo: "Just now",
      unread: true,
      type
    };
    saveNotificationsState([newNotif, ...notifications]);
  };

  const addInboxMessage = (sender: string, subject: string, content: string) => {
    const newMsg: AppInboxMessage = {
      id: `MSG-${Date.now()}`,
      sender,
      subject,
      timeAgo: "Just now",
      read: false,
      content
    };
    saveInboxState([newMsg, ...inboxMessages]);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    saveNotificationsState(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    saveNotificationsState(updated);
  };

  const markInboxRead = (id: string) => {
    const updated = inboxMessages.map(m => m.id === id ? { ...m, read: true } : m);
    saveInboxState(updated);
  };

  const markAllInboxRead = () => {
    const updated = inboxMessages.map(m => ({ ...m, read: true }));
    saveInboxState(updated);
  };

  const deleteInboxMessage = (id: string) => {
    const updated = inboxMessages.filter(m => m.id !== id);
    saveInboxState(updated);
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updated }));
    addNotification("Profile Updated", `Your personal profile details were updated successfully.`, "SECURITY");
    addInboxMessage(
      "FinEdge Security",
      "Account Profile Update Confirmation",
      "Your personal account profile details (Name, Contact, or Address) were updated successfully. If you did not authorize this change, please contact fraud support immediately."
    );
  };

  const [pendingApprovals, setPendingApprovals] = useState([
    { id: "PA-001", type: "BENEFICIARY" as const, title: "Beneficiary Addition", subtitle: "Amit Sharma - HDFC Bank (•••• 4920)", timeAgo: "2 hrs ago" },
    { id: "PA-002", type: "LOAN" as const, title: "Loan Application", subtitle: "Personal Loan - ₹5,00,000 @ 10.5% p.a.", timeAgo: "1 day ago", amount: 500000 },
    { id: "PA-003", type: "HIGH_VALUE_TRANSFER" as const, title: "High Value Transfer", subtitle: "RTGS Transfer to TechCorp (₹2,50,000)", timeAgo: "Just now", amount: 250000 }
  ]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    const data = await MockApi.getAccounts();
    setAccounts(data);
    
    const initialStates: Record<string, VerificationState> = {};
    data.forEach(acc => {
      if (!verificationStates[acc.id]) {
        initialStates[acc.id] = "NOT_VERIFIED";
      }
    });
    setVerificationStates(prev => ({ ...initialStates, ...prev }));
    
    const activeAccId = selectedAccountId || (data.length > 0 ? data[0].id : null);
    if (activeAccId) {
      if (!selectedAccountId) setSelectedAccountId(activeAccId);
      await fetchTransactions(activeAccId);
    }
    setIsLoading(false);
  };

  const fetchTransactions = async (accountId: string) => {
    const data = await MockApi.getTransactions(accountId);
    setTransactions(data);
  };

  const refreshAllData = async () => {
    const data = await MockApi.getAccounts();
    setAccounts(data);
    const activeId = selectedAccountId || (data.length > 0 ? data[0].id : "");
    if (activeId) {
      const txs = await MockApi.getTransactions(activeId);
      setTransactions(txs);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const selectAccount = (id: string) => {
    setSelectedAccountId(id);
    fetchTransactions(id);
  };

  const requestVerification = (id: string) => {
    if (id) {
      setVerificationStates(prev => ({ ...prev, [id]: "VERIFICATION_REQUIRED" }));
    }
  };

  const cancelVerification = (id: string) => {
    if (id) {
      setVerificationStates(prev => ({ ...prev, [id]: "NOT_VERIFIED" }));
    }
  };

  const verifyAccount = async (id: string) => {
    setVerificationStates(prev => ({ ...prev, [id]: "VERIFYING" }));
    try {
      const token = await MockApi.requestBalanceAccess(id);
      const success = await MockApi.verifyBalanceAccess(id, token);
      if (success) {
        setVerificationStates(prev => ({ ...prev, [id]: "VERIFIED" }));
        return true;
      }
    } catch (e) {}
    setVerificationStates(prev => ({ ...prev, [id]: "FAILED" }));
    return false;
  };

  const hideBalance = (id: string) => {
    setVerificationStates(prev => ({ ...prev, [id]: "NOT_VERIFIED" }));
  };

  const toggleTotalBalanceVisibility = () => {
    setIsTotalBalanceHidden(prev => !prev);
  };

  const executeTransfer = async (from: string, to: string, amount: number) => {
    await MockApi.transferFunds(from, to, amount);
    await refreshAllData();
    if (amount > 0) {
      addNotification("Transfer Executed", `₹${amount.toLocaleString("en-IN")} debited from account.`, "DEBIT");
      addInboxMessage(
        "Bank Transfers",
        `Fund Transfer Advice: ₹${amount.toLocaleString("en-IN")}`,
        `Your direct transfer of ₹${amount.toLocaleString("en-IN")} has been debited from your account and processed successfully.`
      );
    }
  };

  const updateAccountLimits = async (accountId: string, daily: number, transaction: number, atm: number) => {
    await MockApi.updateLimits(accountId, daily, transaction, atm);
    await refreshAllData();
    addNotification("Limits Updated", `Daily transfer limits updated for account ${accountId}.`, "SECURITY");
    addInboxMessage(
      "Security Alerts",
      `Account Limits Modified: ${accountId}`,
      `The daily transaction limit for account ${accountId} was modified to ₹${daily.toLocaleString("en-IN")}.`
    );
  };

  const toggleAccountFreeze = async (accountId: string) => {
    const updated = await MockApi.toggleFreezeAccount(accountId);
    setAccounts(prev => prev.map(a => a.id === accountId ? updated : a));
    const isFrozen = updated.status === "FROZEN";
    addNotification(
      isFrozen ? "Account Frozen" : "Account Unfrozen",
      `Account ${accountId} ${isFrozen ? 'has been frozen for security' : 'is now active'}.`,
      "SECURITY"
    );
    addInboxMessage(
      "Security Alerts",
      isFrozen ? `Account Frozen Notice: ${accountId}` : `Account Reactivated: ${accountId}`,
      isFrozen
        ? `Account ${accountId} was frozen to prevent unauthorized activity. Contact support if you need assistance.`
        : `Account ${accountId} has been unfrozen and is fully active for online transfers and transactions.`
    );
  };

  const payBill = async (accountId: string, billerName: string, category: string, amount: number) => {
    await MockApi.payBill(accountId, billerName, category, amount);
    await refreshAllData();
    addNotification("Bill Payment Successful", `₹${amount.toLocaleString("en-IN")} paid to ${billerName}.`, "DEBIT");
    addInboxMessage(
      "Utility Bill Payments",
      `Bill Payment Receipt: ${billerName}`,
      `Your utility payment of ₹${amount.toLocaleString("en-IN")} to ${billerName} (${category}) was processed successfully.`
    );
  };

  const rechargeMobile = async (accountId: string, mobileNumber: string, operator: string, amount: number) => {
    await MockApi.rechargeMobile(accountId, mobileNumber, operator, amount);
    await refreshAllData();
    addNotification("Mobile Recharge Successful", `₹${amount.toLocaleString("en-IN")} recharge done for ${mobileNumber}.`, "DEBIT");
    addInboxMessage(
      "Prepaid Recharges",
      `Mobile Recharge Advice: ${mobileNumber}`,
      `Mobile recharge of ₹${amount.toLocaleString("en-IN")} for number ${mobileNumber} (${operator}) completed successfully.`
    );
  };

  const createFixedDeposit = async (sourceAccountId: string, amount: number, tenureMonths: number, interestRate: number) => {
    const newFd = await MockApi.createFixedDeposit(sourceAccountId, amount, tenureMonths, interestRate);
    await refreshAllData();
    addNotification("Fixed Deposit Created", `New FD created for ₹${amount.toLocaleString("en-IN")} at ${interestRate}% p.a.`, "CREDIT");
    addInboxMessage(
      "Deposits Desk",
      `Fixed Deposit Advice: FD-${newFd.id || "NEW"}`,
      `Your Fixed Deposit of ₹${amount.toLocaleString("en-IN")} for ${tenureMonths} months at ${interestRate}% p.a. interest has been booked successfully.`
    );
    return newFd;
  };

  const investMutualFund = async (accountId: string, fundName: string, amount: number, isSip: boolean) => {
    await MockApi.investMutualFund(accountId, fundName, amount, isSip);
    await refreshAllData();
    addNotification("Investment Executed", `${isSip ? 'SIP' : 'Lump-sum'} investment of ₹${amount.toLocaleString("en-IN")} in ${fundName}.`, "DEBIT");
    addInboxMessage(
      "Wealth Management",
      `Investment Confirmation: ${fundName}`,
      `Your ${isSip ? 'Monthly SIP' : 'Lump-sum'} order of ₹${amount.toLocaleString("en-IN")} in ${fundName} was submitted to NAV allocation.`
    );
  };

  const approvePendingItem = async (id: string, actionType: "APPROVE_BENEFICIARY" | "APPROVE_LOAN" | "VERIFY_OTP", payload?: any) => {
    const targetAccId = selectedAccountId || accounts[0]?.id;
    if (actionType === "APPROVE_LOAN" && targetAccId && payload?.amount) {
      await MockApi.transferFunds(targetAccId, targetAccId, 0);
      const targetAcc = accounts.find(a => a.id === targetAccId);
      if (targetAcc) targetAcc.balance += payload.amount;
      addNotification("Loan Sanctioned", `₹${payload.amount.toLocaleString("en-IN")} credited to your account.`, "CREDIT");
      addInboxMessage(
        "Loan Sanctions",
        `Loan Disbursal Advice: ₹${payload.amount.toLocaleString("en-IN")}`,
        `Congratulations! Your personal loan application of ₹${payload.amount.toLocaleString("en-IN")} has been approved and credited to your account.`
      );
    } else if (actionType === "VERIFY_OTP" && targetAccId && payload?.amount) {
      const targetAcc = accounts.find(a => a.id === targetAccId);
      if (targetAcc && targetAcc.balance >= payload.amount) {
        targetAcc.balance -= payload.amount;
      }
      addNotification("High Value Transfer Executed", `₹${payload.amount.toLocaleString("en-IN")} debited for RTGS transfer.`, "DEBIT");
      addInboxMessage(
        "RTGS Operations",
        `High-Value RTGS Transfer Executed: ₹${payload.amount.toLocaleString("en-IN")}`,
        `Your high-value RTGS transfer of ₹${payload.amount.toLocaleString("en-IN")} passed 2FA authorization and was settled.`
      );
    }
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
    await refreshAllData();
  };

  const notificationsCount = notifications.filter(n => n.unread).length;
  const inboxCount = inboxMessages.filter(m => !m.read).length;

  return (
    <AccountContext.Provider value={{
      userProfile,
      updateUserProfile,
      accounts,
      totalBalance,
      verificationStates,
      selectedAccountId,
      transactions,
      isLoading,
      notifications,
      notificationsCount,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      inboxMessages,
      inboxCount,
      markInboxRead,
      markAllInboxRead,
      deleteInboxMessage,
      addInboxMessage,
      refreshAllData,
      selectAccount,
      requestVerification,
      cancelVerification,
      verifyAccount,
      hideBalance,
      isTotalBalanceHidden,
      toggleTotalBalanceVisibility,
      executeTransfer,
      updateAccountLimits,
      toggleAccountFreeze,
      payBill,
      rechargeMobile,
      createFixedDeposit,
      investMutualFund,
      pendingApprovals,
      approvePendingItem
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccounts must be used within AccountProvider");
  return context;
}
