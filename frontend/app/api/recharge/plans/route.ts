import { NextRequest, NextResponse } from "next/server";

export interface RechargePlan {
  id: string;
  name: string;
  price: number;
  validity: string;
  data: string;
  calls: string;
  sms?: string;
  talktime?: string;
  category: "TRULY_UNLIMITED" | "DATA" | "ENTERTAINMENT" | "ANNUAL" | "TOPUP";
  description?: string;
}

const OPERATOR_CODE_MAP: Record<string, string> = {
  "Jio 5G Prepaid": "JIO",
  "Airtel 5G": "AIRTEL",
  "Vi Prepaid": "VI",
  "BSNL Special": "BSNL"
};

const CIRCLE_CODE_MAP: Record<string, string> = {
  "Mumbai": "1",
  "Delhi NCR": "2",
  "Kolkata": "3",
  "Maharashtra & Goa": "4",
  "Karnataka": "5",
  "Tamil Nadu": "6",
  "Gujarat": "7",
  "Andhra Pradesh": "8",
  "UP East": "9",
  "UP West & UK": "10",
  "West Bengal": "11",
  "Punjab": "12"
};

// Expanded complete plan catalogs for India without any caps or slicing
const OPERATOR_CATALOGS: Record<string, RechargePlan[]> = {
  "JIO": [
    { id: "jio-19", name: "Jio Data Booster 1GB", price: 19, validity: "Active Pack", data: "1 GB High Speed", calls: "NA", sms: "NA", category: "DATA", description: "Base plan active pack data top-up" },
    { id: "jio-29", name: "Jio Data Booster 2.5GB", price: 29, validity: "Active Pack", data: "2.5 GB High Speed", calls: "NA", sms: "NA", category: "DATA", description: "High speed data booster" },
    { id: "jio-149", name: "Jio Data Booster 12GB", price: 149, validity: "Active Pack", data: "12 GB High Speed", calls: "NA", sms: "NA", category: "DATA", description: "High Speed Data add-on for existing pack" },
    { id: "jio-219", name: "Jio Data Booster 25GB", price: 219, validity: "Active Pack", data: "25 GB High Speed", calls: "NA", sms: "NA", category: "DATA", description: "Bulk high speed data add-on" },
    { id: "jio-209", name: "Jio 1GB/Day Pack", price: 209, validity: "22 Days", data: "1.0 GB/Day", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited Calls + 100 SMS/day + JioTV" },
    { id: "jio-239", name: "Jio True 5G Starter", price: 239, validity: "22 Days", data: "1.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data + 100 SMS/day + JioTV, JioCinema" },
    { id: "jio-299", name: "Jio True 5G Unlimited", price: 299, validity: "28 Days", data: "1.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data + 100 SMS/day + JioTV, JioCinema" },
    { id: "jio-349", name: "Jio 2GB/Day Hero", price: 349, validity: "28 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data + 100 SMS/day + JioCloud" },
    { id: "jio-399", name: "Jio 3GB/Day Ultra", price: 399, validity: "28 Days", data: "3.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "3GB/Day High Speed + Unlimited 5G Data" },
    { id: "jio-479", name: "Jio 56 Days Value", price: 479, validity: "56 Days", data: "1.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "56 Days Unlimited Calls + 1.5GB/Day" },
    { id: "jio-529", name: "Jio 56 Days 2GB/Day", price: 529, validity: "56 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "56 Days Unlimited 5G + 2GB/Day" },
    { id: "jio-749", name: "Jio 84 Days Value Pack", price: 749, validity: "84 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data for 84 days + Jio Apps" },
    { id: "jio-859", name: "Jio 84 Days Super Value", price: 859, validity: "84 Days", data: "2.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "2.5GB/Day + Unlimited 5G Data + Disney+ Hotstar" },
    { id: "jio-999", name: "Jio 84 Days 3GB/Day Max", price: 999, validity: "84 Days", data: "3.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "84 Days 3GB/Day + Unlimited 5G + Hotstar" },
    { id: "jio-449", name: "Jio Cinema Premium Combo", price: 449, validity: "28 Days", data: "3.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "ENTERTAINMENT", description: "Includes JioCinema Premium Subscription" },
    { id: "jio-888", name: "Jio OTT Bundle 15 Apps", price: 888, validity: "84 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "ENTERTAINMENT", description: "Hotstar, SonyLIV, Zee5, JioCinema Premium Bundle" },
    { id: "jio-2999", name: "Jio Annual 365 Days Base", price: 2999, validity: "365 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "ANNUAL", description: "365 Days Validity + Unlimited 5G Data" },
    { id: "jio-3599", name: "Jio Annual 365 Days Pro", price: 3599, validity: "365 Days", data: "2.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "ANNUAL", description: "365 Days Validity + Unlimited 5G + FanCode" },
    { id: "jio-10", name: "Jio TopUp ₹10", price: 10, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 7.47", category: "TOPUP", description: "Main Account Balance TopUp" },
    { id: "jio-20", name: "Jio TopUp ₹20", price: 20, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 14.95", category: "TOPUP", description: "Main Account Balance TopUp" },
    { id: "jio-50", name: "Jio TopUp ₹50", price: 50, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 39.37", category: "TOPUP", description: "Main Account Balance TopUp" },
    { id: "jio-100", name: "Jio TopUp ₹100", price: 100, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 81.75", category: "TOPUP", description: "Main Account Balance TopUp" },
    { id: "jio-500", name: "Jio TopUp ₹500", price: 500, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 420.73", category: "TOPUP", description: "Full Talktime TopUp" },
    { id: "jio-1000", name: "Jio TopUp ₹1000", price: 1000, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 841.46", category: "TOPUP", description: "Full Talktime TopUp" }
  ],
  "AIRTEL": [
    { id: "airtel-19", name: "Airtel Data Pack 1GB", price: 19, validity: "1 Day", data: "1 GB High Speed", calls: "NA", sms: "NA", category: "DATA", description: "1 Day High Speed Data Topup" },
    { id: "airtel-29", name: "Airtel Data Pack 2GB", price: 29, validity: "1 Day", data: "2 GB High Speed", calls: "NA", sms: "NA", category: "DATA", description: "2GB High Speed Data Pack" },
    { id: "airtel-181", name: "Airtel Data Pack 15GB", price: 181, validity: "30 Days", data: "15 GB Bulk Data", calls: "NA", sms: "NA", category: "DATA", description: "Standalone 15GB High Speed Data Pack" },
    { id: "airtel-301", name: "Airtel Data Pack 50GB", price: 301, validity: "Active Pack", data: "50 GB Bulk Data", calls: "NA", sms: "NA", category: "DATA", description: "50GB Bulk Data Add-on" },
    { id: "airtel-239", name: "Airtel Truly Unlimited 1GB", price: 239, validity: "24 Days", data: "1.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited 5G + Wynk Music + Free Hellotunes" },
    { id: "airtel-299", name: "Airtel Truly Unlimited 1.5GB", price: 299, validity: "28 Days", data: "1.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited 5G + Apollo 24|7 Circle + Wynk Music" },
    { id: "airtel-379", name: "Airtel 2GB/Day 5G Unlimited", price: 379, validity: "1 Month", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data + Hello Tunes + Wynk" },
    { id: "airtel-479", name: "Airtel 56 Days Unlimited", price: 479, validity: "56 Days", data: "1.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "56 Days Unlimited Calls + 1.5GB/Day + 5G" },
    { id: "airtel-549", name: "Airtel 56 Days 2GB/Day", price: 549, validity: "56 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "56 Days Unlimited Calls + 2GB/Day + 5G" },
    { id: "airtel-719", name: "Airtel 84 Days Super Saver", price: 719, validity: "84 Days", data: "1.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "84 Days Unlimited Calls + 1.5GB/Day + 5G" },
    { id: "airtel-839", name: "Airtel 84 Days Unlimited 2GB", price: 839, validity: "84 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data + Disney+ Hotstar Mobile 3M" },
    { id: "airtel-999", name: "Airtel Amazon Prime Pack", price: 999, validity: "84 Days", data: "2.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "ENTERTAINMENT", description: "Amazon Prime Subscription 84 Days + Unlimited 5G" },
    { id: "airtel-499", name: "Airtel Disney+ Hotstar Combo", price: 499, validity: "28 Days", data: "3.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "ENTERTAINMENT", description: "3GB/Day + Disney+ Hotstar Mobile 3 Months" },
    { id: "airtel-1799", name: "Airtel Annual Talk & Data", price: 1799, validity: "365 Days", data: "24 GB Total Data", calls: "Unlimited", sms: "3600 SMS", category: "ANNUAL", description: "365 Days Unlimited Calls + 24GB Bulk Data" },
    { id: "airtel-2999", name: "Airtel Annual Value 365D", price: 2999, validity: "365 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "ANNUAL", description: "365 Days Full Year Validity + Unlimited 5G" },
    { id: "airtel-3359", name: "Airtel Annual Disney+ Hotstar", price: 3359, validity: "365 Days", data: "2.5 GB/Day + 5G", calls: "Unlimited", sms: "100 SMS/Day", category: "ANNUAL", description: "1 Year Disney+ Hotstar + Unlimited 5G" },
    { id: "airtel-10", name: "Airtel Talktime ₹10", price: 10, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 7.47", category: "TOPUP", description: "Standard Talktime Topup" },
    { id: "airtel-20", name: "Airtel Talktime ₹20", price: 20, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 14.95", category: "TOPUP", description: "Standard Talktime Topup" },
    { id: "airtel-100", name: "Airtel Talktime ₹100", price: 100, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 81.75", category: "TOPUP", description: "Standard Talktime Topup" },
    { id: "airtel-500", name: "Airtel Talktime ₹500", price: 500, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 420.73", category: "TOPUP", description: "Full Talktime Topup" }
  ],
  "VI": [
    { id: "vi-19", name: "Vi Data Pack 1GB", price: 19, validity: "1 Day", data: "1 GB High Speed", calls: "NA", sms: "NA", category: "DATA", description: "1 Day High Speed Data Topup" },
    { id: "vi-151", name: "Vi Disney+ Hotstar Data Pack", price: 151, validity: "30 Days", data: "8 GB Data", calls: "NA", sms: "NA", category: "DATA", description: "8GB Data + Disney+ Hotstar Mobile 3 Months" },
    { id: "vi-299", name: "Vi Hero Unlimited 1.5GB", price: 299, validity: "28 Days", data: "1.5 GB/Day", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Binge All Night (12AM-6AM) + Weekend Data Rollover" },
    { id: "vi-359", name: "Vi Hero Unlimited 3GB", price: 359, validity: "28 Days", data: "3.0 GB/Day", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "3GB/Day + Night Binge + Data Delight 2GB extra" },
    { id: "vi-479", name: "Vi Hero 56 Days 1.5GB", price: 479, validity: "56 Days", data: "1.5 GB/Day", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "56 Days Validity + Night Binge + Weekend Rollover" },
    { id: "vi-719", name: "Vi 84 Days Hero Unlimited", price: 719, validity: "84 Days", data: "1.5 GB/Day", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "84 Days Validity + Binge All Night + Data Rollover" },
    { id: "vi-839", name: "Vi 84 Days Hero 2GB/Day", price: 839, validity: "84 Days", data: "2.0 GB/Day", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "84 Days Validity + 2GB/Day + Night Binge" },
    { id: "vi-418", name: "Vi Movies & TV VIP Combo", price: 418, validity: "28 Days", data: "100 GB Bulk", calls: "NA", sms: "NA", category: "ENTERTAINMENT", description: "100GB Bulk Data + Vi Movies & TV VIP" },
    { id: "vi-3099", name: "Vi Annual 365 Days Pack", price: 3099, validity: "365 Days", data: "2.0 GB/Day", calls: "Unlimited", sms: "100 SMS/Day", category: "ANNUAL", description: "365 Days + Disney+ Hotstar 1 Year + Binge All Night" },
    { id: "vi-10", name: "Vi TopUp ₹10", price: 10, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 7.47", category: "TOPUP", description: "Talktime Balance Topup" },
    { id: "vi-50", name: "Vi TopUp ₹50", price: 50, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 39.37", category: "TOPUP", description: "Talktime Balance Topup" },
    { id: "vi-100", name: "Vi TopUp ₹100", price: 100, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 81.75", category: "TOPUP", description: "Talktime Balance Topup" }
  ],
  "BSNL": [
    { id: "bsnl-98", name: "BSNL Data Special 2GB/Day", price: 98, validity: "22 Days", data: "2.0 GB/Day", calls: "NA", sms: "NA", category: "DATA", description: "High Speed 2GB/Day Data STV" },
    { id: "bsnl-199", name: "BSNL Voice & Data 1.5GB", price: 199, validity: "30 Days", data: "1.5 GB/Day", calls: "Unlimited", sms: "100 SMS/Day", category: "TRULY_UNLIMITED", description: "Unlimited Calls to Any Network + 1.5GB/Day + EROS Now" },
    { id: "bsnl-397", name: "BSNL Long Validity 150 Days", price: 397, validity: "150 Days", data: "2.0 GB/Day (60D)", calls: "Unlimited (60D)", sms: "100 SMS/Day (60D)", category: "ANNUAL", description: "150 Days Plan Validity + 60 Days Unlimited" },
    { id: "bsnl-797", name: "BSNL 300 Days Long Validity", price: 797, validity: "300 Days", data: "2.0 GB/Day (60D)", calls: "Unlimited (60D)", sms: "100 SMS/Day (60D)", category: "ANNUAL", description: "300 Days Plan Validity + 60 Days Free Unlimited" },
    { id: "bsnl-1999", name: "BSNL 365 Days Super Value", price: 1999, validity: "365 Days", data: "600 GB Bulk", calls: "Unlimited", sms: "100 SMS/Day", category: "ANNUAL", description: "365 Days Unlimited Calls + 600GB High Speed Data" },
    { id: "bsnl-10", name: "BSNL TopUp ₹10", price: 10, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 7.47", category: "TOPUP", description: "Talktime Topup" },
    { id: "bsnl-100", name: "BSNL TopUp ₹100", price: 100, validity: "Unlimited", data: "0 GB", calls: "NA", sms: "NA", talktime: "₹ 81.75", category: "TOPUP", description: "Talktime Topup" }
  ]
};

// Helper function to extract individual plan from generic JSON object
function parseItemToPlan(item: any, idx: number, opCode: string, circleCode: string, circleParam: string, catName?: string): RechargePlan | null {
  const price = parseFloat(item.rs || item.price || item.amount || 0);
  if (!price || price <= 0) return null;

  const desc = item.desc || item.description || item.details || item.plan_name || "";
  const validity = item.validity || item.validity_days || "Standard";

  const has5G = desc.toLowerCase().includes("5g");
  const hasGB = desc.toLowerCase().includes("gb");
  const isUnlimitedCalls = desc.toLowerCase().includes("unlimited") || desc.toLowerCase().includes("truly");

  const dataStr = item.data || (hasGB ? desc : "Standard Data");
  const callsStr = item.calls || (isUnlimitedCalls ? "Unlimited" : "Standard");
  const smsStr = item.sms || (desc.toLowerCase().includes("sms") ? "100 SMS/Day" : "NA");
  const talktimeStr = item.talktime || item.tt ? `₹ ${item.talktime || item.tt}` : undefined;

  let category: RechargePlan["category"] = "TRULY_UNLIMITED";
  const catLower = (catName || item.category || "").toLowerCase();
  if (catLower.includes("topup") || catLower.includes("fulltt")) {
    category = "TOPUP";
  } else if (catLower.includes("data") || catLower.includes("3g/4g") || catLower.includes("add-on")) {
    category = "DATA";
  } else if (catLower.includes("annual") || parseInt(validity) >= 300 || desc.toLowerCase().includes("365")) {
    category = "ANNUAL";
  } else if (catLower.includes("entertainment") || desc.toLowerCase().includes("hotstar") || desc.toLowerCase().includes("cinema")) {
    category = "ENTERTAINMENT";
  }

  return {
    id: `planapi-${opCode}-${circleCode}-${idx}-${price}`,
    name: desc ? (desc.length > 35 ? `${desc.substring(0, 35)}...` : desc) : `${opCode} ₹${price} Pack`,
    price,
    validity: typeof validity === "number" ? `${validity} Days` : validity,
    data: dataStr,
    calls: callsStr,
    sms: smsStr,
    talktime: talktimeStr,
    category,
    description: desc || `${opCode} Recharge Plan for ${circleParam}`
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operatorParam = searchParams.get("operator") || "Jio 5G Prepaid";
    const circleParam = searchParams.get("circle") || "Mumbai";

    const opCode = OPERATOR_CODE_MAP[operatorParam] || "JIO";
    const circleCode = CIRCLE_CODE_MAP[circleParam] || "1";

    // Read PlanAPI key securely from backend process environment
    const apiKey = process.env.PLAN_API_KEY || process.env.NEXT_PUBLIC_PLAN_API_KEY;

    let livePlans: RechargePlan[] = [];

    // Attempt external PlanAPI HTTP fetch if PlanAPI Key is provided
    if (apiKey) {
      try {
        const externalUrl = `https://planapi.in/api/Mobile/MorePlan?operator_info=${opCode}&circle_code=${circleCode}&apikey=${apiKey}`;
        const externalRes = await fetch(externalUrl, { cache: "no-store" });
        if (externalRes.ok) {
          const rawData = await externalRes.json();
          let itemIdx = 0;

          // Case 1: Standard PlanAPI records object with category keys (FULLTT, TOPUP, 3G/4G, COMBO, etc.)
          if (rawData && rawData.records && typeof rawData.records === "object") {
            const records = rawData.records;
            Object.keys(records).forEach((catKey) => {
              const items = records[catKey];
              if (Array.isArray(items)) {
                items.forEach((item: any) => {
                  const plan = parseItemToPlan(item, itemIdx++, opCode, circleCode, circleParam, catKey);
                  if (plan) livePlans.push(plan);
                });
              }
            });
          }
          // Case 2: Array at rawData.data or rawData.plans
          else if (rawData && Array.isArray(rawData.data || rawData.plans || rawData.results)) {
            const arr = rawData.data || rawData.plans || rawData.results;
            arr.forEach((item: any) => {
              const plan = parseItemToPlan(item, itemIdx++, opCode, circleCode, circleParam);
              if (plan) livePlans.push(plan);
            });
          }
          // Case 3: Root array response
          else if (Array.isArray(rawData)) {
            rawData.forEach((item: any) => {
              const plan = parseItemToPlan(item, itemIdx++, opCode, circleCode, circleParam);
              if (plan) livePlans.push(plan);
            });
          }
        }
      } catch (err) {
        console.warn("External PlanAPI request skipped/failed, serving structured catalog", err);
      }
    }

    // Fallback to complete operator catalog if live external fetch returns empty
    if (livePlans.length === 0) {
      livePlans = OPERATOR_CATALOGS[opCode] || OPERATOR_CATALOGS["JIO"];
    }

    return NextResponse.json({
      success: true,
      operator: operatorParam,
      circle: circleParam,
      operatorCode: opCode,
      circleCode,
      count: livePlans.length,
      plans: livePlans
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch mobile recharge plans" },
      { status: 500 }
    );
  }
}
