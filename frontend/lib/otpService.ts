export type OtpPurposeType =
  | "FUND_TRANSFER"
  | "MOBILE_RECHARGE"
  | "BILL_PAYMENT"
  | "NOMINEE_UPDATE"
  | "ACCOUNT_FREEZE"
  | "REGISTRATION"
  | "LOGIN_STEP_UP"
  | "PASSWORD_RESET"
  | "NEW_ACCOUNT";

export interface OtpResponseData {
  success: boolean;
  verificationToken?: string;
  purpose?: OtpPurposeType;
  status?: string;
  proofToken?: string;
  expiresInSeconds?: number;
  resendCooldownSeconds?: number;
  remainingAttempts?: number;
  message?: string;
  error?: string;
}

export const requestOtpSession = async (
  purpose: OtpPurposeType,
  targetIdentifier?: string,
  username: string = "alex_demo"
): Promise<OtpResponseData> => {
  try {
    const res = await fetch("/api/otp/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, purpose, targetIdentifier }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Network error generating OTP." };
  }
};

export const verifyOtpSession = async (
  verificationToken: string,
  otp: string
): Promise<OtpResponseData> => {
  try {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationToken, otp }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Network error verifying OTP." };
  }
};

export const resendOtpSession = async (
  verificationToken: string
): Promise<OtpResponseData> => {
  try {
    const res = await fetch("/api/otp/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationToken }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Network error resending OTP." };
  }
};
