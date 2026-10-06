import { VaultDocument } from "../../types";
import { createVaultDocumentRecord, signDocumentAccessToken } from "./vaultEngine";

export function handleVaultUpload(
  file: File,
  docType: string,
  existingDocs: VaultDocument[]
): { document: VaultDocument; updatedDocs: VaultDocument[] } {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size exceeds maximum allowed limit of 10MB");
  }
  const newDoc = createVaultDocumentRecord(file, docType);
  const updatedDocs = [newDoc, ...existingDocs];
  return { document: newDoc, updatedDocs };
}

export function handleRequestDocumentAccess(
  docId: string,
  pin: string,
  existingDocs: VaultDocument[]
): {
  success: boolean;
  error?: string;
  token?: string;
  expiresAt?: number;
  updatedDocs?: VaultDocument[];
} {
  const result = signDocumentAccessToken(docId, pin);
  if (!result.success || !result.token || !result.expiresAt) {
    return { success: false, error: result.error || "Access denied." };
  }

  const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const updatedDocs = existingDocs.map((doc) => {
    if (doc.id === docId) {
      return {
        ...doc,
        auditLogs: [
          {
            id: `LOG-ACC-${Date.now()}`,
            timestamp: `${nowStr} ${timeStr}`,
            action: "2FA Signed Access Token Issued (60s validity)",
            ipAddress: "103.44.12.89",
            status: "SUCCESS" as const,
          },
          ...doc.auditLogs,
        ],
      };
    }
    return doc;
  });

  return {
    success: true,
    token: result.token,
    expiresAt: result.expiresAt,
    updatedDocs,
  };
}
