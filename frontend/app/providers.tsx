"use client";

import React from "react";
import { AccountProvider } from "../context/AccountContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AccountProvider>{children}</AccountProvider>;
}
