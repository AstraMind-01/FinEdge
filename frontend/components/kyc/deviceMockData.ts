import { LinkedDeviceData } from "../modals/DeviceDetailsModal";

export const INITIAL_MOCK_DEVICES: LinkedDeviceData[] = [
  {
    id: "dev-1",
    name: 'MacBook Pro 16"',
    type: "Laptop",
    os: "macOS Sonoma 14.5",
    browser: "Chrome 127.0",
    ip: "192.168.1.104",
    location: "New Delhi, India",
    fingerprint: "FP-892A-4410-MBP",
    firstLinked: "15 Jan 2024",
    lastActive: "Active Now",
    isCurrent: true,
    status: "ACTIVE",
    activities: [
      { id: "act-1", action: "2FA Security PIN Verification", timestamp: "2026-08-10 17:48", ip: "192.168.1.104", details: "Authenticated for High Yield Fixed Deposit Details", type: "SECURITY" },
      { id: "act-2", action: "OTP Email Verification", timestamp: "2026-08-10 11:52", ip: "192.168.1.104", details: "Verified successfully! ProofToken: FE-PROOF-828FB4", type: "SECURITY" },
      { id: "act-3", action: "Session Login", timestamp: "2026-08-10 09:15", ip: "192.168.1.104", details: "Password & Email OTP 2FA login from Chrome", type: "LOGIN" },
      { id: "act-4", action: "KYC Vault Document Access", timestamp: "2026-08-09 21:04", ip: "192.168.1.104", details: "Aadhaar Card copy unlocked via 2FA", type: "PROFILE" },
    ]
  },
  {
    id: "dev-2",
    name: 'iPhone 15 Pro',
    type: "Smartphone",
    os: "iOS 17.5",
    browser: "FinEdge App v3.4",
    ip: "103.21.124.89",
    location: "Gurgaon, India",
    fingerprint: "FP-77B1-9920-IPH",
    firstLinked: "02 Mar 2024",
    lastActive: "2 hours ago",
    isCurrent: false,
    status: "ACTIVE",
    activities: [
      { id: "act-5", action: "Mobile Utility Recharge", timestamp: "2026-08-10 15:30", ip: "103.21.124.89", details: "Recharged Jio 5G Prepaid ₹999", type: "TRANSFER" },
      { id: "act-6", action: "Biometric TouchID Verified", timestamp: "2026-08-10 15:28", ip: "103.21.124.89", details: "FaceID biometric auth passed", type: "SECURITY" },
      { id: "act-7", action: "Quick Fund Transfer", timestamp: "2026-08-08 18:40", ip: "103.21.124.89", details: "Transferred ₹5,000 to Alex Demo", type: "TRANSFER" },
    ]
  },
  {
    id: "dev-3",
    name: 'Windows 11 Workstation',
    type: "Desktop",
    os: "Windows 11 Pro 23H2",
    browser: "Microsoft Edge 126.0",
    ip: "49.36.210.12",
    location: "Mumbai, India",
    fingerprint: "FP-12C9-8801-WIN",
    firstLinked: "10 Nov 2023",
    lastActive: "Yesterday, 19:40",
    isCurrent: false,
    status: "ACTIVE",
    activities: [
      { id: "act-8", action: "Session Login", timestamp: "2026-08-09 19:40", ip: "49.36.210.12", details: "Authorized biometric login via Edge", type: "LOGIN" },
      { id: "act-9", action: "Tax Certificate Generated", timestamp: "2026-08-09 19:45", ip: "49.36.210.12", details: "Downloaded Form 16 / 26AS Statement PDF", type: "PROFILE" },
    ]
  },
  {
    id: "dev-4",
    name: 'iPad Air 5th Gen',
    type: "Tablet",
    os: "iPadOS 17.4",
    browser: "Safari 17.4",
    ip: "103.44.12.89",
    location: "Bengaluru, India",
    fingerprint: "FP-44A9-0021-IPD",
    firstLinked: "22 Dec 2023",
    lastActive: "04 Aug 2026",
    isCurrent: false,
    status: "REVOKED",
    activities: [
      { id: "act-10", action: "Device Access Revoked", timestamp: "2026-08-04 14:10", ip: "103.44.12.89", details: "Manually revoked by account administrator", type: "SECURITY" },
    ]
  }
];
