import { Account, Transaction, VerificationState, UserProfile, VaultDocument } from "../../types";

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

export interface AccountContextType {
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
  cancelVerification: (id?: string) => void;
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

export const DEFAULT_USER_PROFILE: UserProfile = {
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

export const DEFAULT_VAULT_DOCUMENTS: VaultDocument[] = [
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
