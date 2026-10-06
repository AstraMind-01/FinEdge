"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Transaction, VerificationState, UserProfile, VaultDocument } from "../types";
import { MockApi } from "../lib/mockApi";
import { useNotifications } from "./NotificationContext";
import {
  AppNotification,
  AppInboxMessage,
  AccountContextType,
  DEFAULT_USER_PROFILE,
  DEFAULT_VAULT_DOCUMENTS,
} from "./account/types";
import {
  SecuritySession,
  verifyPinAttempt,
  isSessionActive,
  getSessionRemainingSeconds,
} from "./account/securityPinEngine";
import {
  processTransferPayment,
  processBillPayment,
  processMobileRecharge,
} from "./account/paymentEngine";
import {
  fetchAccountsList,
  fetchAccountTransactions,
  buildNewAccount,
} from "./account/accountOperations";
import { handleVaultUpload, handleRequestDocumentAccess } from "./account/vaultStateHelper";
import { processApprovalItem } from "./account/approvalEngine";
import { useAccountMessaging } from "./account/useAccountMessaging";

export type { AppNotification, AppInboxMessage, AccountContextType };

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { addNotification: addPageNotification } = useNotifications();
  const messaging = useAccountMessaging(addPageNotification);

  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verificationStates, setVerificationStates] = useState<Record<string, VerificationState>>({});
  const [securitySessions, setSecuritySessions] = useState<Record<string, SecuritySession>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTotalBalanceHidden, setIsTotalBalanceHidden] = useState(true);

  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>(DEFAULT_VAULT_DOCUMENTS);
  const [documentAccessTokens, setDocumentAccessTokens] = useState<Record<string, { token: string; expiresAt: number }>>({});

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("finedge_user_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setUserProfile((prev) => ({ ...prev, ...parsed }));
      }
      const savedVault = localStorage.getItem("finedge_user_vault_documents");
      if (savedVault) {
        setVaultDocuments(JSON.parse(savedVault));
      }
    } catch {}
  }, []);

  const saveUserProfileState = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    try {
      localStorage.setItem("finedge_user_profile", JSON.stringify(newProfile));
    } catch (e) {
      console.error("Failed to persist user profile:", e);
    }
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updated };
    saveUserProfileState(newProfile);
    messaging.addNotification("Profile Updated", "Your personal profile details were updated successfully.", "SECURITY");
    messaging.addInboxMessage(
      "FinEdge Security",
      "Account Profile Update Confirmation",
      "Your personal account profile details (Name, Contact, or Address) were updated successfully. If you did not authorize this change, please contact fraud support immediately."
    );
  };

  const [pendingApprovals, setPendingApprovals] = useState([
    { id: "PA-001", type: "BENEFICIARY" as const, title: "Beneficiary Addition", subtitle: "Amit Sharma - HDFC Bank (•••• 4920)", timeAgo: "2 hrs ago" },
    { id: "PA-002", type: "LOAN" as const, title: "Loan Application", subtitle: "Personal Loan - ₹5,00,000 @ 10.5% p.a.", timeAgo: "1 day ago", amount: 500000 },
    { id: "PA-003", type: "HIGH_VALUE_TRANSFER" as const, title: "High Value Transfer", subtitle: "RTGS Transfer to TechCorp (₹2,50,000)", timeAgo: "Just now", amount: 250000 },
  ]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAccountsList();
      setAccounts(data);
      const initialStates: Record<string, VerificationState> = {};
      data.forEach((acc) => {
        if (!verificationStates[acc.id]) {
          initialStates[acc.id] = "NOT_VERIFIED";
        }
      });
      setVerificationStates((prev) => ({ ...initialStates, ...prev }));
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
      const data = await fetchAccountTransactions(accountId);
      setTransactions(data);
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
      setVerificationStates((prev) => ({ ...prev, [id]: "VERIFICATION_REQUIRED" }));
    }
  };

  const cancelVerification = (id?: string) => {
    setVerificationStates((prev) => {
      const next = { ...prev };
      if (id) {
        next[id] = "NOT_VERIFIED";
      } else {
        Object.keys(next).forEach((k) => {
          next[k] = "NOT_VERIFIED";
        });
      }
      return next;
    });
  };

  const verifyAccount = async (id: string): Promise<boolean> => {
    setVerificationStates((prev) => ({ ...prev, [id]: "VERIFYING" }));
    try {
      const token = await MockApi.requestBalanceAccess(id);
      const verified = await MockApi.verifyBalanceAccess(id, token);
      if (verified) {
        const sessionDuration = 5 * 60 * 1000;
        setSecuritySessions((prev) => ({
          ...prev,
          [id]: { token, expiresAt: Date.now() + sessionDuration, failedAttempts: 0, isLocked: false },
        }));
        setVerificationStates((prev) => ({ ...prev, [id]: "VERIFIED" }));
        messaging.addNotification("Security Access Granted", `Session unlocked for account ${id}.`, "SECURITY");
        return true;
      }
      setVerificationStates((prev) => ({ ...prev, [id]: "NOT_VERIFIED" }));
      return false;
    } catch {
      setVerificationStates((prev) => ({ ...prev, [id]: "NOT_VERIFIED" }));
      return false;
    }
  };

  const verifyAccountWithPin = async (id: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    const res = verifyPinAttempt(id, pin, securitySessions[id]);
    if (res.session) {
      setSecuritySessions((prev) => ({ ...prev, [id]: res.session! }));
    }
    if (res.success) {
      setVerificationStates((prev) => ({ ...prev, [id]: "VERIFIED" }));
      messaging.addNotification("Security Access Granted", `Session unlocked for account ${id}.`, "SECURITY");
    } else if (res.session?.isLocked) {
      messaging.addNotification(
        "Security Lockout Triggered",
        `Account ${id} temporarily locked for 60 seconds due to 3 incorrect attempts.`,
        "SECURITY"
      );
    }
    return { success: res.success, error: res.error };
  };

  const isAccountVerified = (id: string): boolean => {
    return isSessionActive(securitySessions[id]);
  };

  const getAccountSessionRemainingTime = (id: string): number => {
    return getSessionRemainingSeconds(securitySessions[id]);
  };

  const hideBalance = (id: string) => {
    setVerificationStates((prev) => ({ ...prev, [id]: "NOT_VERIFIED" }));
    setSecuritySessions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const toggleTotalBalanceVisibility = () => {
    setIsTotalBalanceHidden((prev) => !prev);
  };

  const executeTransfer = async (from: string, to: string, amount: number) => {
    const { transaction, paymentId } = await processTransferPayment(from, to, amount, userProfile);
    await refreshAllData();
    setTransactions((prev) => [transaction, ...prev]);

    messaging.addNotification(
      "Transfer Executed via Razorpay",
      `₹${amount.toLocaleString("en-IN")} debited from account. Payment ID: ${paymentId}`,
      "DEBIT"
    );
    messaging.addInboxMessage(
      "Bank Transfers",
      `Fund Transfer Advice: ₹${amount.toLocaleString("en-IN")}`,
      `Your fund transfer of ₹${amount.toLocaleString("en-IN")} was processed via Razorpay (Payment ID: ${paymentId}).`
    );
  };

  const updateAccountLimits = async (accountId: string, daily: number, transaction: number, atm: number) => {
    await MockApi.updateLimits(accountId, daily, transaction, atm);
    await refreshAllData();
    messaging.addNotification("Limits Updated", `Daily transfer limits updated for account ${accountId}.`, "SECURITY");
    messaging.addInboxMessage(
      "Security Alerts",
      `Account Limits Modified: ${accountId}`,
      `The daily transaction limit for account ${accountId} was modified to ₹${daily.toLocaleString("en-IN")}.`
    );
  };

  const toggleAccountFreeze = async (accountId: string) => {
    const updated = await MockApi.toggleFreezeAccount(accountId);
    setAccounts((prev) => prev.map((a) => (a.id === accountId ? updated : a)));
    const isFrozen = updated.status === "FROZEN";
    messaging.addNotification(
      isFrozen ? "Account Frozen" : "Account Unfrozen",
      `Account ${accountId} ${isFrozen ? "has been frozen for security" : "is now active"}.`,
      "SECURITY"
    );
    messaging.addInboxMessage(
      "Security Alerts",
      isFrozen ? `Account Frozen Notice: ${accountId}` : `Account Reactivated: ${accountId}`,
      isFrozen
        ? `Account ${accountId} was frozen to prevent unauthorized activity. Contact support if you need assistance.`
        : `Account ${accountId} has been unfrozen and is fully active for online transfers and transactions.`
    );
  };

  const payBill = async (accountId: string, billerName: string, category: string, amount: number) => {
    const { transaction, paymentId } = await processBillPayment(accountId, billerName, category, amount, userProfile);
    await refreshAllData();
    setTransactions((prev) => [transaction, ...prev]);

    messaging.addNotification(
      "Bill Payment via Razorpay",
      `₹${amount.toLocaleString("en-IN")} paid to ${billerName}. Payment ID: ${paymentId}`,
      "DEBIT"
    );
    messaging.addInboxMessage(
      "Utility Bill Payments",
      `Bill Payment Receipt: ${billerName}`,
      `Your bill payment of ₹${amount.toLocaleString("en-IN")} to ${billerName} (${category}) was verified via Razorpay (Payment ID: ${paymentId}).`
    );
  };

  const rechargeMobile = async (accountId: string, mobileNumber: string, operator: string, amount: number) => {
    const { transaction, paymentId } = await processMobileRecharge(accountId, mobileNumber, operator, amount, userProfile);
    await refreshAllData();
    setTransactions((prev) => [transaction, ...prev]);

    messaging.addNotification(
      "Recharge via Razorpay",
      `₹${amount.toLocaleString("en-IN")} recharge for ${mobileNumber}. Payment ID: ${paymentId}`,
      "DEBIT"
    );
    messaging.addInboxMessage(
      "Prepaid Recharges",
      `Mobile Recharge Advice: ${mobileNumber}`,
      `Recharge of ₹${amount.toLocaleString("en-IN")} for ${mobileNumber} (${operator}) was verified via Razorpay (Payment ID: ${paymentId}).`
    );
  };

  const createNewAccount = async (newAccountData: Partial<Account> & { initialDeposit?: number }): Promise<Account> => {
    const { account: created, initialTransaction } = buildNewAccount(newAccountData, accounts.length, userProfile);
    setAccounts((prev) => [created, ...prev]);

    if (initialTransaction) {
      setTransactions((prev) => [initialTransaction, ...prev]);
    }

    messaging.addNotification("Account Activated", `Your new ${created.name} (${created.maskedNumber}) is active & provisioned.`, "SYSTEM");
    messaging.addInboxMessage(
      "FinEdge Welcome Desk",
      `New Account Activation: ${created.name}`,
      `Welcome to FinEdge Banking! Your new ${created.name} (${created.accountNumber}) has been provisioned successfully with initial balance of ₹${created.balance.toLocaleString("en-IN")}. IFSC Code: ${created.ifsc}.`
    );

    return created;
  };

  const createFixedDeposit = async (sourceAccountId: string, amount: number, tenureMonths: number, interestRate: number) => {
    const newFd = await MockApi.createFixedDeposit(sourceAccountId, amount, tenureMonths, interestRate);
    await refreshAllData();
    messaging.addNotification("Fixed Deposit Created", `New FD created for ₹${amount.toLocaleString("en-IN")} at ${interestRate}% p.a.`, "CREDIT");
    messaging.addInboxMessage(
      "Deposits Desk",
      `Fixed Deposit Advice: FD-${newFd.id || "NEW"}`,
      `Your Fixed Deposit of ₹${amount.toLocaleString("en-IN")} for ${tenureMonths} months at ${interestRate}% p.a. interest has been booked successfully.`
    );
    return newFd;
  };

  const investMutualFund = async (accountId: string, fundName: string, amount: number, isSip: boolean) => {
    await MockApi.investMutualFund(accountId, fundName, amount, isSip);
    await refreshAllData();
    messaging.addNotification("Investment Executed", `${isSip ? "SIP" : "Lump-sum"} investment of ₹${amount.toLocaleString("en-IN")} in ${fundName}.`, "DEBIT");
    messaging.addInboxMessage(
      "Wealth Management",
      `Investment Confirmation: ${fundName}`,
      `Your ${isSip ? "Monthly SIP" : "Lump-sum"} order of ₹${amount.toLocaleString("en-IN")} in ${fundName} was submitted to NAV allocation.`
    );
  };

  const approvePendingItem = async (id: string, actionType: "APPROVE_BENEFICIARY" | "APPROVE_LOAN" | "VERIFY_OTP", payload?: any) => {
    const targetAccId = selectedAccountId || accounts[0]?.id;
    const targetAcc = accounts.find((a) => a.id === targetAccId);
    const result = await processApprovalItem(id, actionType, targetAcc, payload);
    if (result.notification) {
      messaging.addNotification(result.notification.title, result.notification.subtitle, result.notification.type);
      messaging.addInboxMessage(result.notification.inboxSender, result.notification.inboxSubject, result.notification.inboxBody);
    }
    setPendingApprovals((prev) => prev.filter((item) => item.id !== id));
    await refreshAllData();
  };

  const saveVaultState = (docs: VaultDocument[]) => {
    setVaultDocuments(docs);
    try {
      localStorage.setItem("finedge_user_vault_documents", JSON.stringify(docs));
    } catch {}
  };

  const uploadVaultDocument = async (file: File, docType: string): Promise<VaultDocument> => {
    const { document: newDoc, updatedDocs } = handleVaultUpload(file, docType, vaultDocuments);
    saveVaultState(updatedDocs);

    messaging.addNotification("Document Encrypted & Stored", `${newDoc.title} (${newDoc.fileName}) encrypted & saved to Document Vault.`, "SECURITY");
    messaging.addInboxMessage(
      "Document Vault Security",
      `Vault Deposit Advice: ${newDoc.title}`,
      `Your document "${newDoc.fileName}" was scanned for viruses, encrypted using AES-256 (${newDoc.encryptionKeyId}), and saved under private storage ID ${newDoc.storageId}.`
    );

    return newDoc;
  };

  const requestDocumentAccess = async (docId: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    const res = handleRequestDocumentAccess(docId, pin, vaultDocuments);
    if (!res.success || !res.token || !res.expiresAt) {
      return { success: false, error: res.error || "Access denied." };
    }

    setDocumentAccessTokens((prev) => ({
      ...prev,
      [docId]: { token: res.token!, expiresAt: res.expiresAt! },
    }));

    if (res.updatedDocs) {
      saveVaultState(res.updatedDocs);
    }

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

  return (
    <AccountContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        accounts,
        totalBalance,
        verificationStates,
        selectedAccountId,
        transactions,
        isLoading,
        notifications: messaging.notifications,
        notificationsCount: messaging.notificationsCount,
        markNotificationRead: messaging.markNotificationRead,
        markAllNotificationsRead: messaging.markAllNotificationsRead,
        addNotification: messaging.addNotification,
        inboxMessages: messaging.inboxMessages,
        inboxCount: messaging.inboxCount,
        markInboxRead: messaging.markInboxRead,
        markAllInboxRead: messaging.markAllInboxRead,
        deleteInboxMessage: messaging.deleteInboxMessage,
        addInboxMessage: messaging.addInboxMessage,
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
        getDocumentRemainingAccessTime,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccounts must be used within AccountProvider");
  return context;
}
