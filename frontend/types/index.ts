export interface Account {
  id: string;
  type: "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT" | "RECURRING_DEPOSIT";
  name: string;
  maskedNumber: string;
  lastFour: string;
  balance: number;
  currency: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED" | "DORMANT";
  accountHolder: string;
  interestRate?: number;
  maturityDate?: string;
  ifsc?: string;
  branch?: string;
  openingDate?: string;
  nominee?: string;
  nomineeRelation?: string;
  interestEarned?: number;
  minBalance?: number;
  linkedCard?: string;
  monthlyInstallment?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  merchantName: string;
  amount: number;
  date: string;
  type: "CREDIT" | "DEBIT";
  category: "Shopping" | "Food" | "Travel" | "Bills" | "Transfer" | "Salary" | "Others" | "Investment";
  status?: "SUCCESS" | "PENDING" | "FAILED";
  referenceId?: string;
  paymentMode?: string;
  remarks?: string;
  timestamp?: string; // ISO date format for accurate grouping
}

export type VerificationState = "NOT_VERIFIED" | "VERIFICATION_REQUIRED" | "VERIFYING" | "VERIFIED" | "FAILED";

export interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId?: string;
  avatarUrl?: string;
}

export interface ScheduledTransferHistory {
  date: string;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
}

export interface ScheduledTransfer {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  purpose: string;
  fromAccountId: string;
  amount: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "ONCE";
  isRecurring: boolean;
  transferMode: "IMPS" | "NEFT" | "RTGS" | "UPI";
  startDate: string;
  endDate?: string;
  nextDate: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "COMPLETED" | "FAILED";
  history: ScheduledTransferHistory[];
}

export interface IntlBeneficiary {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  bankName: string;
  swiftCode: string;
  iban: string;
  bankAddress: string;
  recipientAddress: string;
}

export interface ExchangeRate {
  currency: string;
  countryCode: string;
  rate: number;
  trend: "up" | "down";
}
