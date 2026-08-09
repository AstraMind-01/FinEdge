export interface Account {
  id: string;
  type: "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT" | "RECURRING_DEPOSIT";
  name: string;
  maskedNumber: string;
  accountNumber?: string;
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
  dailyLimit?: number;
  transactionLimit?: number;
  atmLimit?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  merchantName: string;
  amount: number;
  date: string;
  type: "CREDIT" | "DEBIT";
  category: "Shopping" | "Food" | "Travel" | "Bills" | "Transfer" | "Salary" | "Others" | "Investment" | "Deposit";
  status?: "SUCCESS" | "PENDING" | "FAILED";
  referenceId?: string;
  paymentMode?: string;
  remarks?: string;
  timestamp?: string;
}

export type VerificationState = "NOT_VERIFIED" | "VERIFICATION_REQUIRED" | "VERIFYING" | "VERIFIED" | "FAILED";

export interface Beneficiary {
  id: string;
  code?: string;
  name: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  ifscCode?: string;
  upiId?: string;
  avatarUrl?: string;
  accountType?: "SAVINGS" | "CURRENT";
  transferLimit?: number;
  coolingPeriodUntil?: string;
  status?: "ACTIVE" | "COOLING_PERIOD" | "BLOCKED";
  addedAt?: string;
  category?: "Domestic" | "International";
}

export interface RecentBeneficiaryTransfer {
  id: string;
  beneficiaryId: string;
  name: string;
  amount: number;
  formattedAmount: string;
  date: string;
  avatarUrl?: string | null;
  bankName?: string;
  accountNumber?: string;
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

export interface CardControls {
  onlineTransactions: boolean;
  internationalTx: boolean;
  internationalUsage?: boolean;
  contactless: boolean;
  contactlessPayments?: boolean;
  atmWithdrawals: boolean;
  posTransactions: boolean;
  dailyLimit: number;
  atmLimit: number;
  dailyAtmLimit?: number;
  dailyPosLimit?: number;
  onlineLimit: number;
}

export interface BankCard {
  id: string;
  name?: string;
  cardHolderName: string;
  cardholderName?: string;
  cardNumber: string;
  fullNumber?: string;
  maskedNumber: string;
  expiryDate: string;
  expiry?: string;
  cvv: string;
  type: "DEBIT" | "CREDIT";
  variant: string;
  tier?: string;
  theme: "purple-gold" | "navy-gold" | "teal-silver" | string;
  status: "ACTIVE" | "BLOCKED" | "FROZEN";
  network: "VISA" | "MASTERCARD" | "RUPAY";
  linkedAccountId?: string;
  creditLimit?: number;
  availableCredit?: number;
  spentThisMonth?: number;
  dueDate?: string;
  minAmountDue?: number;
  rewardPoints?: number;
  rewardsPoints?: number;
  isDefault?: boolean;
  controls: CardControls;
}

export interface CardOffer {
  id: string;
  title: string;
  description: string;
  merchant: string;
  merchantName?: string;
  discount: string;
  discountDesc?: string;
  validUntil: string;
  validTill?: string;
  code?: string;
  category: string;
}

export interface EmiScheduleItem {
  month: string;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  status: "PAID" | "PENDING" | "OVERDUE";
}

export interface Loan {
  id: string;
  name: string;
  accountNumber: string;
  type: "HOME" | "PERSONAL" | "CAR" | "EDUCATION";
  status: "ACTIVE" | "CLOSED" | "OVERDUE";
  originalAmount: number;
  outstandingBalance: number;
  interestRate: number;
  totalTenure: number;
  emiPaid: number;
  nextEmiAmount: number;
  nextEmiDate: string;
  disbursementDate: string;
  monthlyEmi: number;
  interestPaidThisYear: number;
  overdueCount?: number;
  emiSchedule: EmiScheduleItem[];
}

export interface Holding {
  id: string;
  name: string;
  category: string;
  units: number;
  avgNav: number;
  currentNav?: number;
  investedAmount: number;
  currentValue: number;
  returnAmount?: number;
  returnPercent?: number;
  returns3Y?: number;
  rating?: number;
  type?: string;
  folioNumber?: string;
}

export interface SIP {
  id: string;
  fundName: string;
  fundHouse?: string;
  category?: string;
  nav?: number;
  returns3Y?: number;
  returns5Y?: number;
  rating?: number;
  riskGrade?: string;
  amount: number;
  monthlyAmount?: number;
  frequency: string;
  debitDate?: number;
  nextDebitDate: string;
  status?: string;
  totalInvested?: number;
  currentValue?: number;
  installmentsPaid?: number;
  stepUpPercent?: number;
  linkedAccount?: string;
  folioNumber?: string;
}

export interface InvestmentGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  percentAchieved: number;
}

export interface PortfolioDataPoint {
  month: string;
  value: number;
}

export interface Deposit {
  id: string;
  name: string;
  type: "FD" | "RD";
  principalAmount: number;
  monthlyDepositAmount?: number;
  monthlyInstallment?: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
  totalDepositedAmount?: number;
  accumulatedAmount?: number;
  nextDueDate?: string;
  status?: string;
}

export interface LoanApplication {
  id: string;
  referenceNumber: string;
  loanType: string;
  loanTypeName: string;
  requestedAmount: number;
  tenureMonths: number;
  interestRate: number;
  calculatedEmi: number;
  status: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: string;
  dynamicFields: Record<string, any>;
  uploadedDocuments: { name: string; type: string; size: string; status: string }[];
  eligibilityScore: number;
  foirRatio: number;
}

export interface UserAddress {
  currentAddress: string;
  permanentAddress: string;
  isSameAsCurrent: boolean;
  proofDocumentType: string;
  proofDocumentUrl?: string;
  lastUpdated: string;
}

export interface VerificationEvent {
  id: string;
  label: string;
  date: string;
  status: "completed" | "active" | "pending" | "rejected";
  description?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  branch: string;
  avatarUrl: string;
  customerID: string;
  kycStatus: string;
  memberSince: string;
}

export interface VaultAuditLog {
  id: string;
  timestamp: string;
  action: string;
  ipAddress: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
}

export interface VaultDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileSizeBytes: number;
  fileType: string;
  status: "Verified" | "Under Review" | "Pending" | "Expired" | "Rejected";
  uploadDate: string;
  lastUpdatedDate: string;
  expiryDate?: string;
  documentNumber: string;
  authority: string;
  encryptionKeyId: string;
  storageId: string;
  textPreview: string;
  virusScanStatus: "CLEAN" | "SCANNING" | "INFECTED";
  auditLogs: VaultAuditLog[];
}
