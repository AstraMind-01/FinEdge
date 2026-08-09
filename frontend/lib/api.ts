/**
 * FinEdge Real API
 * ────────────────
 * Mirrors the MockApi interface but calls the real Java Spring Boot backend
 * through the Next.js /api/* proxy.
 *
 * API Routes (via API Gateway on :8080):
 *   Auth:         POST /api/v1/auth/login | /register | /refresh | /logout
 *                 GET  /api/v1/auth/me
 *   Accounts:     GET  /api/v1/accounts               — list user's accounts
 *                 GET  /api/v1/accounts/:id            — get single account
 *                 GET  /api/v1/accounts/:id/balance    — get balance
 *                 GET  /api/v1/accounts/:id/limits     — get account limits
 *                 POST /api/v1/accounts/:id/freeze     — freeze account
 *                 POST /api/v1/accounts/:id/unfreeze   — unfreeze account
 *   Transactions: GET  /api/v1/me/transactions         — all user transactions
 *                 GET  /api/v1/transactions/:id        — single transaction
 *                 GET  /api/v1/transactions/account/:num
 *                 POST /api/v1/transactions/transfer
 *                 POST /api/v1/transactions/deposit
 *                 POST /api/v1/transactions/withdraw
 */

import { apiClient, setTokens, clearTokens } from "./apiClient";

// ─── Backend Response Types ───────────────────────────────────────────────────

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface BackendUserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface BackendAccountResponse {
  id: number;
  accountNumber: string;
  ownerUsername: string;
  accountType: "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT" | "RECURRING_DEPOSIT";
  balance: number;
  status: "ACTIVE" | "FROZEN" | "CLOSED" | "DORMANT";
  createdAt: string;
}

export interface BackendTransactionResponse {
  id: number;
  transactionRef: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  fromAccountNumber: string | null;
  toAccountNumber: string | null;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  initiatedByUsername: string;
  createdAt: string;
  completedAt: string | null;
}

export interface BackendBalanceResponse {
  accountId: number;
  accountNumber: string;
  balance: number;
  currency: string;
  asOf: string;
}

export interface BackendLimitsResponse {
  accountId: number;
  dailyTransferLimit: number;
  dailyTransferUsed: number;
  dailyWithdrawalLimit: number;
  dailyWithdrawalUsed: number;
  singleTransactionLimit: number;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const AuthApi = {
  /**
   * Login — POST /api/v1/auth/login
   * Stores the JWT tokens in localStorage on success.
   */
  async login(username: string, password: string): Promise<BackendAuthResponse> {
    const res = await apiClient.post<BackendAuthResponse>(
      "/auth/login",
      { username, password },
      { skipAuth: true }
    );
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  /**
   * Register — POST /api/v1/auth/register
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<BackendAuthResponse> {
    const res = await apiClient.post<BackendAuthResponse>(
      "/auth/register",
      { username, email, password },
      { skipAuth: true }
    );
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  /**
   * Logout — POST /api/v1/auth/logout
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post("/auth/logout", { refreshToken });
    } finally {
      clearTokens();
    }
  },

  /**
   * Get current user — GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<BackendUserResponse> {
    return apiClient.get<BackendUserResponse>("/auth/me");
  },
};

// ─── Account API ──────────────────────────────────────────────────────────────

export const AccountApi = {
  /**
   * List all accounts for the authenticated user
   * GET /api/v1/accounts
   */
  async getAccounts(): Promise<BackendAccountResponse[]> {
    return apiClient.get<BackendAccountResponse[]>("/accounts");
  },

  /**
   * Get a single account by ID
   * GET /api/v1/accounts/:id
   */
  async getAccountById(id: number): Promise<BackendAccountResponse> {
    return apiClient.get<BackendAccountResponse>(`/accounts/${id}`);
  },

  /**
   * Get balance for an account
   * GET /api/v1/accounts/:id/balance
   */
  async getBalance(id: number): Promise<BackendBalanceResponse> {
    return apiClient.get<BackendBalanceResponse>(`/accounts/${id}/balance`);
  },

  /**
   * Get transaction limits for an account
   * GET /api/v1/accounts/:id/limits
   */
  async getLimits(id: number): Promise<BackendLimitsResponse> {
    return apiClient.get<BackendLimitsResponse>(`/accounts/${id}/limits`);
  },

  /**
   * Freeze an account
   * POST /api/v1/accounts/:id/freeze
   */
  async freezeAccount(id: number): Promise<BackendAccountResponse> {
    return apiClient.post<BackendAccountResponse>(`/accounts/${id}/freeze`);
  },

  /**
   * Unfreeze an account
   * POST /api/v1/accounts/:id/unfreeze
   */
  async unfreezeAccount(id: number): Promise<BackendAccountResponse> {
    return apiClient.post<BackendAccountResponse>(`/accounts/${id}/unfreeze`);
  },
};

// ─── Transaction API ──────────────────────────────────────────────────────────

export const TransactionApi = {
  /**
   * Get all transactions for the authenticated user
   * GET /api/v1/me/transactions
   */
  async getMyTransactions(): Promise<BackendTransactionResponse[]> {
    return apiClient.get<BackendTransactionResponse[]>("/me/transactions");
  },

  /**
   * Get transactions for a specific account number
   * GET /api/v1/transactions/account/:accountNumber
   */
  async getAccountTransactions(
    accountNumber: string
  ): Promise<BackendTransactionResponse[]> {
    return apiClient.get<BackendTransactionResponse[]>(
      `/transactions/account/${accountNumber}`
    );
  },

  /**
   * Get a single transaction by ID
   * GET /api/v1/transactions/:id
   */
  async getTransactionById(id: number): Promise<BackendTransactionResponse> {
    return apiClient.get<BackendTransactionResponse>(`/transactions/${id}`);
  },

  /**
   * Fund transfer between two accounts
   * POST /api/v1/transactions/transfer
   */
  async transfer(
    fromAccountNumber: string,
    toAccountNumber: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<BackendTransactionResponse> {
    return apiClient.post<BackendTransactionResponse>("/transactions/transfer", {
      fromAccountNumber,
      toAccountNumber,
      amount,
      idempotencyKey: idempotencyKey ?? crypto.randomUUID(),
    });
  },

  /**
   * Deposit money into an account
   * POST /api/v1/transactions/deposit
   */
  async deposit(
    toAccountNumber: string,
    amount: number
  ): Promise<BackendTransactionResponse> {
    return apiClient.post<BackendTransactionResponse>("/transactions/deposit", {
      toAccountNumber,
      amount,
      idempotencyKey: crypto.randomUUID(),
    });
  },

  /**
   * Withdraw money from an account
   * POST /api/v1/transactions/withdraw
   */
  async withdraw(
    fromAccountNumber: string,
    amount: number
  ): Promise<BackendTransactionResponse> {
    return apiClient.post<BackendTransactionResponse>("/transactions/withdraw", {
      fromAccountNumber,
      amount,
      idempotencyKey: crypto.randomUUID(),
    });
  },
};
