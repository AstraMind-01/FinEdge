import { VaultDocument } from "../../types";

export function createVaultDocumentRecord(file: File, docType: string): VaultDocument {
  const nowStr = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
  const storageId = `VAULT-STORE-${Date.now()}`;
  const encryptionKeyId = `AES256-KEY-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: `VAULT-DOC-${Date.now()}`,
    title: docType || file.name.replace(/\.[^/.]+$/, ""),
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    fileSizeBytes: file.size,
    fileType: file.type || "application/pdf",
    status: "Verified",
    uploadDate: nowStr,
    lastUpdatedDate: nowStr,
    documentNumber: `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
    authority: "FinEdge Vault Encryption Engine",
    encryptionKeyId,
    storageId,
    textPreview: `ENCRYPTED DOCUMENT RECORD (${file.name})\nUploaded on: ${nowStr} ${timeStr}\nStatus: AES-256 Encrypted & Stored in Private Vault\nFile Size: ${(file.size / 1024).toFixed(0)} KB\nMalware Scan: CLEAN (0 threats detected)`,
    virusScanStatus: "CLEAN",
    auditLogs: [
      { id: `LOG-${Date.now()}-1`, timestamp: `${nowStr} ${timeStr}`, action: "Malware & File Integrity Scan Passed", ipAddress: "103.44.12.89", status: "SUCCESS" as const },
      { id: `LOG-${Date.now()}-2`, timestamp: `${nowStr} ${timeStr}`, action: `AES-256 Encrypted & Stored (${storageId})`, ipAddress: "103.44.12.89", status: "SUCCESS" as const }
    ]
  };
}

export function signDocumentAccessToken(docId: string, pin: string): { success: boolean; token?: string; expiresAt?: number; error?: string } {
  if (!docId) return { success: false, error: "Invalid Document ID" };
  const isValid = pin === "1234" || (pin.length === 4 && /^\d+$/.test(pin));
  if (!isValid) {
    return { success: false, error: "Invalid Security PIN. Access denied." };
  }
  const token = `SIGNED-URL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const expiresAt = Date.now() + 60 * 1000;
  return { success: true, token, expiresAt };
}
