"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { useAccounts } from "../context/AccountContext";

interface Props {
  accountId: string | null;
  onClose: () => void;
}

export default function AccountVerificationDialog({ accountId, onClose }: Props) {
  const { accounts, verificationStates, verifyAccount } = useAccounts();
  const account = accounts.find(a => a.id === accountId);
  const state = accountId ? verificationStates[accountId] : "NOT_VERIFIED";

  const handleVerify = async () => {
    if (accountId) {
      const success = await verifyAccount(accountId);
      if (success) {
        setTimeout(() => onClose(), 1500);
      }
    }
  };

  if (!account) return null;

  return (
    <Dialog open={!!accountId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>View Account Balance</DialogTitle>
          <DialogDescription>
            For your security, additional verification is required to view this account's balance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="bg-surface-container-highest p-4 rounded-lg flex items-center justify-between border border-outline-variant/20">
            <span className="text-on-surface font-medium">{account.name}</span>
            <span className="font-mono text-on-surface-variant text-sm">{account.maskedNumber}</span>
          </div>

          <div className="text-center text-sm">
            {state === "VERIFYING" && (
              <span className="text-tertiary animate-pulse">Security Verification — Simulation in progress...</span>
            )}
            {state === "VERIFIED" && (
              <span className="text-primary font-medium">Identity verified. Account balance is now visible.</span>
            )}
            {state === "FAILED" && (
              <span className="text-error font-medium">Verification failed. Your account balance remains protected.</span>
            )}
            {state === "VERIFICATION_REQUIRED" && (
              <span className="text-on-surface-variant">Security Verification — Simulation</span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            className="w-full sm:w-auto"
            onClick={handleVerify}
            disabled={state === "VERIFYING" || state === "VERIFIED"}
          >
            {state === "VERIFYING" ? "Verifying..." : state === "VERIFIED" ? "Verified" : "Continue Verification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
