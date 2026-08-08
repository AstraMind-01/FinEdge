package com.onlinebanking.account.entity;

/**
 * Represents the operational state of a specific bank account.
 * 
 * DESIGN NOTE (User Status vs. Account Status Separation):
 * - User Status (in auth-service): Controls user authentication (ACTIVE, LOCKED, DISABLED).
 * - Account Status (in account-service): Controls individual bank account transactions (ACTIVE, INACTIVE, FROZEN).
 * 
 * An ACTIVE user may own a FROZEN account (e.g., pending verification or suspicious transaction flag).
 */
public enum AccountStatus {
    ACTIVE,
    INACTIVE,
    FROZEN
}
