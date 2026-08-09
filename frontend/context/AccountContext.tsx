"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Transaction, VerificationState, UserProfile, VaultDocument } from "../types";
import { MockApi } from "../lib/mockApi";
import { AccountApi, TransactionApi } from "../lib/api";

// ─── Feature Flag ─────────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_USE_MOCK=false in .env.local to switch to the real backend.
// When true (default), uses in-memory mock data so the app works without a backend.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

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
  createNewAccount: (newAccountData: Partial<Account> & { initialDeposit?: number }) => Promise<Account>;
  investMutualFund: (accountId: string, fundName: string, amount: number, isSip: boolean) => Promise<void>;
  pendingApprovals: { id: string; type: "BENEFICIARY" | "LOAN" | "HIGH_VALUE_TRANSFER"; title: string; subtitle: string; timeAgo: string; amount?: number; accountId?: string }[];
  approvePendingItem: (id: string, actionType: "APPROVE_BENEFICIARY" | "APPROVE_LOAN" | "VERIFY_OTP", payload?: any) => Promise<void>;
  cancelVerification: (id: string) => void;
  verifyAccountWithPin: (id: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  isAccountVerified: (id: string) => boolean;
  getAccountSessionRemainingTime: (id: string) => number;
  isTotalBalanceHidden: boolean;
  toggleTotalBalanceVisibility: () => void;

  // Banking-Grade Secure Document Vault Engine
  vaultDocuments: VaultDocument[];
  uploadVaultDocument: (file: File, docType: string) => Promise<VaultDocument>;
  requestDocumentAccess: (docId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  isDocumentAccessGranted: (docId: string) => boolean;
  getDocumentRemainingAccessTime: (docId: string) => number;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  // Default profile — used as fallback when nothing is persisted
  const DEFAULT_USER_PROFILE: UserProfile = {
    name: "Soumya Ranjan",
    email: "soumya@finedge.bank",
    phone: "+91 98765 43210",
    address: "402, Skyline Towers, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051",
    branch: "Mumbai Corporate",
    avatarUrl: "https://lh3.googleusercontent.com/aida/AP1WRLsSwZ4DjkxkSDZcZiAFoC9WKVvWBd8YATVOK-aK4N5vTMk-Tk_6V8WlDvdomJ6bYe3HBp3PNJ57I_UT61tstMRF7kFhOemD1si94bMRwOkkiJtzmqqVRoT-zrcdNLikddEewBScNfE0KSklZnZdxG8S9jZVhAjVQHsJTFgrR9hBngkx66hTESe8CD9gV0WcYBEfci5hir_QikVnOaQyKCE_F5dZy8foopgH73duZTbFG4POtZ2DI7uiZIE",
    customerID: "FE9842",
    kycStatus: "Fully Verified",
    memberSince: "Oct 2021"
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verificationStates, setVerificationStates] = useState<Record<string, VerificationState>>({});
  const [securitySessions, setSecuritySessions] = useState<Record<string, { token: string; expiresAt: number; failedAttempts: number; isLocked: boolean; lockUntil?: number }>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTotalBalanceHidden, setIsTotalBalanceHidden] = useState(false);

  // Dynamic Notification Stream (Empty by default)
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Dynamic Bank Inbox Stream (Empty by default)
  const [inboxMessages, setInboxMessages] = useState<AppInboxMessage[]>([]);

  const DEFAULT_VAULT_DOCUMENTS: VaultDocument[] = [
    {
      id: "VAULT-DOC-1001",
      title: "Aadhaar Card",
      fileName: "Aadhaar.pdf",
      fileSize: "1.2 MB",
      fileSizeBytes: 1258291,
      fileType: "application/pdf",
      status: "Verified",
      uploadDate: "15 Jan 2026",
      lastUpdatedDate: "15 Jan 2026",
      expiryDate: "15 Jan 2036",
      documentNumber: "•••• •••• 9912",
      authority: "UIDAI (Govt of India)",
      encryptionKeyId: "AES256-KEY-9941",
      storageId: "VAULT-STORE-1001",
      textPreview: "REPUBLIC OF INDIA - AADHAAR CARD\nName: Soumya Ranjan\nDOB: 12/08/1992\nGender: MALE\nAadhaar No: 4912 8821 9912\nAddress: 402, Skyline Towers, BKC, Mumbai 400051",
      virusScanStatus: "CLEAN",
      auditLogs: [
        { id: "LOG-1", timestamp: "15 Jan 2026 10:30 AM", action: "AES-256 Encrypted & Stored", ipAddress: "103.44.12.89", status: "SUCCESS" },
        { id: "LOG-2", timestamp: "15 Jan 2026 10:31 AM", action: "UIDAI OCR Verification Passed", ipAddress: "10.0.4.12", status: "SUCCESS" }
      ]
    },
    {
      id: "VAULT-DOC-1002",
      title: "PAN Card",
      fileName: "PAN_Card.pdf",
      fileSize: "0.8 MB",
      fileSizeBytes: 838860,
      fileType: "application/pdf",
      status: "Verified",
      uploadDate: "20 Feb 2026",
      lastUpdatedDate: "20 Feb 2026",
      documentNumber: "ABCDE1234F",
      authority: "Income Tax Dept of India",
      encryptionKeyId: "AES256-KEY-9942",
      storageId: "VAULT-STORE-1002",
      textPreview: "INCOME TAX DEPARTMENT - GOVT OF INDIA\nPermanent Account Number: ABCDE1234F\nName: SOUMYA RANJAN\nFather's Name: RAJAT RANJAN\nDate of Birth: 12/08/1992",
      virusScanStatus: "CLEAN",
      auditLogs: [
        { id: "LOG-3", timestamp: "20 Feb 2026 02:15 PM", action: "AES-256 Encrypted & Stored", ipAddress: "103.44.12.89", status: "SUCCESS" },
        { id: "LOG-4", timestamp: "20 Feb 2026 02:16 PM", action: "NSDL PAN Database Matched", ipAddress: "10.0.4.12", status: "SUCCESS" }
      ]
    },
    {
      id: "VAULT-DOC-1003",
      title: "Address Proof",
      fileName: "Address.pdf",
      fileSize: "2.1 MB",
      fileSizeBytes: 2202009,
      fileType: "application/pdf",
      status: "Verified",
      uploadDate: "05 Mar 2026",
      lastUpdatedDate: "05 Mar 2026",
      expiryDate: "10 May 2034",
      documentNumber: "PASSPORT-Z991042",
      authority: "Ministry of External Affairs",
      encryptionKeyId: "AES256-KEY-9943",
      storageId: "VAULT-STORE-1003",
      textPreview: "PASSPORT / ADDRESS PROOF\nPassport No: Z991042\nName: Soumya Ranjan\nAddress: 402, Skyline Towers, BKC, Mumbai 400051\nValid Until: 10 May 2034",
      virusScanStatus: "CLEAN",
      auditLogs: [
        { id: "LOG-5", timestamp: "05 Mar 2026 11:20 AM", action: "AES-256 Encrypted & Stored", ipAddress: "103.44.12.89", status: "SUCCESS" }
      ]
    }
  ];

  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>(DEFAULT_VAULT_DOCUMENTS);
  const [documentAccessTokens, setDocumentAccessTokens] = useState<Record<string, { token: string; expiresAt: number }>>({});

  // Load persisted user profile, notifications, inbox, and vault documents on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("finedge_user_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(prev => ({ ...prev, ...parsed }));
      }
      const savedNotifs = localStorage.getItem("finedge_user_notifications");
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
      const savedInbox = localStorage.getItem("finedge_user_inbox");
      if (savedInbox) {
        setInboxMessages(JSON.parse(savedInbox));
      }
      const savedVault = localStorage.getItem("finedge_user_vault_documents");
      if (savedVault) {
        setVaultDocuments(JSON.parse(savedVault));
      }
    } catch (e) {}
  }, []);

  const saveUserProfileState = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    try {
      localStorage.setItem("finedge_user_profile", JSON.stringify(newProfile));
    } catch (e) {
      console.error("Failed to persist user profile:", e);
    }
  };

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
    const newProfile = { ...userProfile, ...updated };
    saveUserProfileState(newProfile);
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
    try {
      let data: Account[];
      if (USE_MOCK) {
        data = await MockApi.getAccounts();
      } else {
        // Real backend: map BackendAccountResponse → Account shape
        const backendAccounts = await AccountApi.getAccounts();
        data = backendAccounts.map(acc => ({
          id: String(acc.id),
          type: acc.accountType,
          name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
          maskedNumber: `•••• ${acc.accountNumber.slice(-4)}`,
          lastFour: acc.accountNumber.slice(-4),
          balance: acc.balance,
          currency: "INR",
          status: acc.status,
          accountHolder: acc.ownerUsername,
        }));
      }
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
    } catch (err) {
      console.error("[AccountContext] fetchAccounts error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (accountId: string) => {
    try {
      if (USE_MOCK) {
        const data = await MockApi.getTransactions(accountId);
        setTransactions(data);
      } else {
        // Real backend: fetch all user transactions from /me/transactions
        const backendTxs = await TransactionApi.getMyTransactions();
        const data: Transaction[] = backendTxs.map(tx => ({
          id: String(tx.id),
          accountId: tx.fromAccountNumber || tx.toAccountNumber || accountId,
          merchantName: tx.fromAccountNumber
            ? `Transfer from ${tx.fromAccountNumber.slice(-4)}`
            : `Deposit to ${tx.toAccountNumber?.slice(-4)}`,
          amount: tx.type === "WITHDRAWAL" || tx.type === "TRANSFER" ? -Math.abs(tx.amount) : Math.abs(tx.amount),
          date: new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          type: tx.type === "DEPOSIT" ? "CREDIT" : "DEBIT",
          category: "Transfer",
          status: tx.status,
          referenceId: tx.transactionRef,
          timestamp: tx.createdAt,
        }));
        setTransactions(data);
      }
    } catch (err) {
      console.error("[AccountContext] fetchTransactions error:", err);
    }
  };

  const refreshAllData = async () => {
    await fetchAccounts();
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

  const isAccountVerified = (id: string): boolean => {
    if (!id) return false;
    const session = securitySessions[id];
    if (!session) return false;
    if (session.isLocked && session.lockUntil && Date.now() < session.lockUntil) return false;
    if (Date.now() > session.expiresAt) return false;
    return verificationStates[id] === "VERIFIED";
  };

  const getAccountSessionRemainingTime = (id: string): number => {
    if (!id) return 0;
    const session = securitySessions[id];
    if (!session || Date.now() > session.expiresAt) return 0;
    return Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000));
  };

  const verifyAccountWithPin = async (id: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!id) return { success: false, error: "Invalid Account Selected" };

    const now = Date.now();
    const existing = securitySessions[id] || { token: "", expiresAt: 0, failedAttempts: 0, isLocked: false };

    // Check if account is currently locked due to failed attempts
    if (existing.isLocked && existing.lockUntil && now < existing.lockUntil) {
      const remSec = Math.ceil((existing.lockUntil - now) / 1000);
      setVerificationStates(prev => ({ ...prev, [id]: "FAILED" }));
      return { success: false, error: `Account security locked due to multiple failed attempts. Try again in ${remSec}s.` };
    }

    setVerificationStates(prev => ({ ...prev, [id]: "VERIFYING" }));
    await new Promise(r => setTimeout(r, 600)); // Simulate 2FA security token auth delay

    // Security PIN verification: '1234' (or valid 4-digit numeric PIN for demo testing)
    const isValidPin = pin === "1234" || (pin.length === 4 && /^\d+$/.test(pin));

    if (isValidPin) {
      const newToken = `FE-SEC-${now}-${Math.floor(Math.random() * 10000)}`;
      const expiresAt = now + 5 * 60 * 1000; // 5 minutes security session validity

      setSecuritySessions(prev => ({
        ...prev,
        [id]: {
          token: newToken,
          expiresAt,
          failedAttempts: 0,
          isLocked: false
        }
      }));

      setVerificationStates(prev => ({ ...prev, [id]: "VERIFIED" }));
      addNotification("Security Access Granted", `Account details security session activated for account ${id}. Session valid for 5 minutes.`, "SECURITY");
      return { success: true };
    } else {
      const failedAttempts = (existing.failedAttempts || 0) + 1;
      const isLocked = failedAttempts >= 3;
      const lockUntil = isLocked ? now + 60000 : undefined;

      setSecuritySessions(prev => ({
        ...prev,
        [id]: {
          token: "",
          expiresAt: 0,
          failedAttempts,
          isLocked,
          lockUntil
        }
      }));

      setVerificationStates(prev => ({ ...prev, [id]: "FAILED" }));

      if (isLocked) {
        addNotification("Security Lockout Triggered", `Account details access locked for 60s due to 3 consecutive failed security PIN attempts.`, "SECURITY");
        return { success: false, error: "Maximum failed attempts reached (3/3). Account details access locked for 60 seconds." };
      }

      return { success: false, error: `Incorrect Security PIN. ${3 - failedAttempts} attempt(s) remaining.` };
    }
  };

  const verifyAccount = async (id: string) => {
    return (await verifyAccountWithPin(id, "1234")).success;
  };

  const hideBalance = (id: string) => {
    setVerificationStates(prev => ({ ...prev, [id]: "NOT_VERIFIED" }));
    setSecuritySessions(prev => ({ ...prev, [id]: { token: "", expiresAt: 0, failedAttempts: 0, isLocked: false } }));
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

  const createNewAccount = async (newAccountData: Partial<Account> & { initialDeposit?: number }): Promise<Account> => {
    const accType = newAccountData.type || "SAVINGS";
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const accNum = `4092${Math.floor(100000000 + Math.random() * 900000000)}`;
    const depositAmt = newAccountData.initialDeposit || newAccountData.balance || 0;

    const created: Account = {
      id: `ACC-00${accounts.length + 1}`,
      type: accType,
      name: newAccountData.name || (accType === "SAVINGS" ? "High-Yield Savings Account" : accType === "CURRENT" ? "Business Current Account" : accType === "FIXED_DEPOSIT" ? "High Yield Fixed Deposit" : "Wealth Builder RD"),
      maskedNumber: `•••• ${last4}`,
      accountNumber: accNum,
      lastFour: last4,
      balance: depositAmt,
      currency: "INR",
      status: "ACTIVE",
      accountHolder: userProfile.name,
      ifsc: "HDFC0001234",
      branch: userProfile.branch || "Mumbai Corporate",
      openingDate: new Date().toISOString().split("T")[0],
      nominee: newAccountData.nominee || "Registered Nominee",
      nomineeRelation: newAccountData.nomineeRelation || "Spouse",
      dailyLimit: newAccountData.dailyLimit || (accType === "CURRENT" ? 500000 : 100000),
      transactionLimit: 50000,
      atmLimit: 25000,
      linkedCard: `Visa Platinum Debit Card (•••• ${last4})`
    };

    setAccounts(prev => [created, ...prev]);

    // Issue initial credit transaction if funded
    if (depositAmt > 0) {
      const initTx: Transaction = {
        id: `TX-INIT-${Date.now()}`,
        accountId: created.id,
        merchantName: "Initial Account Funding Deposit",
        amount: depositAmt,
        date: "Just now",
        timestamp: new Date().toISOString(),
        type: "CREDIT",
        category: "Deposit",
        status: "SUCCESS"
      };
      setTransactions(prev => [initTx, ...prev]);
    }

    addNotification("Account Activated", `Your new ${created.name} (${created.maskedNumber}) is active & provisioned.`, "SYSTEM");
    addInboxMessage(
      "FinEdge Welcome Desk",
      `New Account Activation: ${created.name}`,
      `Welcome to FinEdge Banking! Your new ${created.name} (${created.accountNumber}) has been provisioned successfully with initial balance of ₹${depositAmt.toLocaleString("en-IN")}. IFSC Code: ${created.ifsc}.`
    );

    return created;
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

  const saveVaultState = (docs: VaultDocument[]) => {
    setVaultDocuments(docs);
    try {
      localStorage.setItem("finedge_user_vault_documents", JSON.stringify(docs));
    } catch (e) {}
  };

  const uploadVaultDocument = async (file: File, docType: string): Promise<VaultDocument> => {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size exceeds maximum allowed limit of 10MB");
    }

    const nowStr = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
    const storageId = `VAULT-STORE-${Date.now()}`;
    const encryptionKeyId = `AES256-KEY-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDoc: VaultDocument = {
      id: `VAULT-DOC-${Date.now()}`,
      title: docType || file.name.replace(/\.[^/.]+$/, ""),
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileSizeBytes: file.size,
      fileType: file.type || "application/pdf",
      status: "Verified",
      uploadDate: nowStr,
      lastUpdatedDate: nowStr,
      documentNumber: `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
      authority: "FinEdge Vault Encryption Engine",
      encryptionKeyId,
      storageId,
      textPreview: `ENCRYPTED DOCUMENT RECORD (${file.name})\nUploaded on: ${nowStr} ${timeStr}\nStatus: AES-256 Encrypted & Stored in Private Vault\nFile Size: ${(file.size / 1024).toFixed(0)} KB\nMalware Scan: CLEAN (0 threats detected)`,
      virusScanStatus: "CLEAN",
      auditLogs: [
        { id: `LOG-${Date.now()}-1`, timestamp: `${nowStr} ${timeStr}`, action: "Malware & File Integrity Scan Passed", ipAddress: "103.44.12.89", status: "SUCCESS" as const },
        { id: `LOG-${Date.now()}-2`, timestamp: `${nowStr} ${timeStr}`, action: `AES-256 Encrypted & Stored (${storageId})`, ipAddress: "103.44.12.89", status: "SUCCESS" as const }
      ]
    };

    const updatedDocs = [newDoc, ...vaultDocuments];
    saveVaultState(updatedDocs);

    addNotification("Document Encrypted & Stored", `${newDoc.title} (${newDoc.fileName}) encrypted & saved to Document Vault.`, "SECURITY");
    addInboxMessage(
      "Document Vault Security",
      `Vault Deposit Advice: ${newDoc.title}`,
      `Your document "${newDoc.fileName}" was scanned for viruses, encrypted using AES-256 (${encryptionKeyId}), and saved under private storage ID ${storageId}.`
    );

    return newDoc;
  };

  const requestDocumentAccess = async (docId: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!docId) return { success: false, error: "Invalid Document ID" };

    const isValid = pin === "1234" || (pin.length === 4 && /^\d+$/.test(pin));
    if (!isValid) {
      return { success: false, error: "Invalid Security PIN. Access denied." };
    }

    const token = `SIGNED-URL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const expiresAt = Date.now() + 60 * 1000; // 60 seconds short-lived access token

    setDocumentAccessTokens(prev => ({
      ...prev,
      [docId]: { token, expiresAt }
    }));

    // Update audit trail on document
    setVaultDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId) {
          const nowStr = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
          const timeStr = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
          return {
            ...doc,
            auditLogs: [
              { id: `LOG-ACC-${Date.now()}`, timestamp: `${nowStr} ${timeStr}`, action: "2FA Signed Access Token Issued (60s validity)", ipAddress: "103.44.12.89", status: "SUCCESS" as const },
              ...doc.auditLogs
            ]
          };
        }
        return doc;
      });
      try {
        localStorage.setItem("finedge_user_vault_documents", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    return { success: true };
  };

  const isDocumentAccessGranted = (docId: string): boolean => {
    if (!docId) return false;
    const tokenInfo = documentAccessTokens[docId];
    if (!tokenInfo) return false;
    return Date.now() < tokenInfo.expiresAt;
  };

  const getDocumentRemainingAccessTime = (docId: string): number => {
    if (!docId) return 0;
    const tokenInfo = documentAccessTokens[docId];
    if (!tokenInfo || Date.now() > tokenInfo.expiresAt) return 0;
    return Math.max(0, Math.ceil((tokenInfo.expiresAt - Date.now()) / 1000));
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
      verifyAccountWithPin,
      isAccountVerified,
      getAccountSessionRemainingTime,
      hideBalance,
      isTotalBalanceHidden,
      toggleTotalBalanceVisibility,
      executeTransfer,
      updateAccountLimits,
      toggleAccountFreeze,
      payBill,
      rechargeMobile,
      createFixedDeposit,
      createNewAccount,
      investMutualFund,
      pendingApprovals,
      approvePendingItem,
      vaultDocuments,
      uploadVaultDocument,
      requestDocumentAccess,
      isDocumentAccessGranted,
      getDocumentRemainingAccessTime
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
