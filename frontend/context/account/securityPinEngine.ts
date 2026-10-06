export interface SecuritySession {
  token: string;
  expiresAt: number;
  failedAttempts: number;
  isLocked: boolean;
  lockUntil?: number;
}

export function verifyPinAttempt(
  accountId: string,
  pin: string,
  currentSession: SecuritySession | undefined
): { success: boolean; error?: string; session?: SecuritySession } {
  const session = currentSession || {
    token: "",
    expiresAt: 0,
    failedAttempts: 0,
    isLocked: false,
  };

  if (session.isLocked && session.lockUntil && Date.now() < session.lockUntil) {
    const remainingSec = Math.ceil((session.lockUntil - Date.now()) / 1000);
    return {
      success: false,
      error: `Account locked due to 3 failed attempts. Try again in ${remainingSec}s.`,
      session,
    };
  }

  if (pin === "1234") {
    const sessionDuration = 5 * 60 * 1000;
    const newSession: SecuritySession = {
      token: `TOKEN-${accountId}-${Date.now()}`,
      expiresAt: Date.now() + sessionDuration,
      failedAttempts: 0,
      isLocked: false,
    };
    return { success: true, session: newSession };
  }

  const failed = (session.failedAttempts || 0) + 1;
  if (failed >= 3) {
    const lockDuration = 60 * 1000;
    const lockedSession: SecuritySession = {
      ...session,
      failedAttempts: failed,
      isLocked: true,
      lockUntil: Date.now() + lockDuration,
    };
    return {
      success: false,
      error: "Too many failed attempts. Account locked for 60 seconds.",
      session: lockedSession,
    };
  }

  const updatedSession: SecuritySession = {
    ...session,
    failedAttempts: failed,
  };
  return {
    success: false,
    error: `Incorrect PIN. ${3 - failed} attempts remaining.`,
    session: updatedSession,
  };
}

export function isSessionActive(session: SecuritySession | undefined): boolean {
  if (!session) return false;
  if (session.isLocked) return false;
  return Date.now() < session.expiresAt;
}

export function getSessionRemainingSeconds(session: SecuritySession | undefined): number {
  if (!session || Date.now() >= session.expiresAt) return 0;
  return Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000));
}
