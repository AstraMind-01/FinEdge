"use client";

import React from "react";
import { AccountProvider } from "../context/AccountContext";
import { NotificationProvider } from "../context/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AccountProvider>{children}</AccountProvider>
    </NotificationProvider>
  );
}
