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
  category: "Shopping" | "Food" | "Travel" | "Bills" | "Transfer" | "Salary" | "Others";
}

export type VerificationState = "NOT_VERIFIED" | "VERIFICATION_REQUIRED" | "VERIFYING" | "VERIFIED" | "FAILED";
