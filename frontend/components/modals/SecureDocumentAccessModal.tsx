"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { useAccounts } from "../../context/AccountContext";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { VaultDocument } from "../../types";

interface Props {
  documentItem: VaultDocument | null;
  onClose: () => void;
  onSuccess: (doc: VaultDocument) => void;
}

export default function SecureDocumentAccessModal({ documentItem, onClose, onSuccess }: Props) {
  const { requestDocumentAccess } = useAccounts();
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (documentItem) {
      setPin("");
      setErrorMsg(null);
      setIsVerifying(false);
    }
  }, [documentItem]);

  if (!documentItem) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    await new Promise(r => setTimeout(r, 600)); // 2FA authentication delay
    const res = await requestDocumentAccess(documentItem.id, pin);

    if (res.success) {
      setTimeout(() => {
        setIsVerifying(false);
        setPin("");
        onSuccess(documentItem);
      }, 500);
    } else {
      setIsVerifying(false);
      setErrorMsg(res.error || "Authentication failed. Incorrect Security PIN.");
    }
  };

  return (
    <Dialog open={!!documentItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-container border border-outline-variant/20 rounded-2xl max-w-md p-6 text-on-surface">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Vault Document Security Barrier</DialogTitle>
              <DialogDescription className="text-xs text-on-surface-variant">
                Enter your 4-Digit Security PIN to generate 60s signed access token
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleVerify} className="flex flex-col gap-4 py-2">
          <div className="bg-surface-high/60 p-4 rounded-xl flex items-center justify-between border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <FileText className="text-primary shrink-0" size={20} />
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-medium">Requested Document</span>
                <p className="font-semibold text-sm mt-0.5">{documentItem.title}</p>
              </div>
            </div>
            <span className="font-mono text-on-surface-variant text-xs font-semibold bg-surface-high px-2.5 py-1 rounded-lg">
              {documentItem.fileName}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant text-center">Enter 4-Digit Transaction / Security PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="••••"
              autoComplete="one-time-code"
              data-lpignore="true"
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-xl font-mono font-bold tracking-[0.3em] focus:outline-none focus:border-primary text-on-surface"
            />
            <span className="text-[11px] text-on-surface-variant text-center">Demo Security PIN: <strong className="text-primary font-mono">1234</strong></span>
          </div>

          <div className="text-center text-xs">
            {isVerifying && (
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center gap-2 font-medium">
                <Lock size={16} className="animate-spin" />
                <span>Generating Short-Lived Signed Access Token...</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-2.5 bg-error/10 text-error rounded-xl flex items-center justify-center gap-2 font-medium text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-outline-variant/10">
            <Button
              type="button"
              onClick={onClose}
              className="bg-surface-high hover:bg-surface-highest text-on-surface border-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary text-on-primary font-medium hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer"
              disabled={isVerifying || pin.length < 4}
            >
              {isVerifying ? "Authorizing..." : "Authorize & View Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
