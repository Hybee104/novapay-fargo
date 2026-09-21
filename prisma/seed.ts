// NovaPAY Bank — deterministic database seed.
// Creates the demo user, a $650,000.00 account, a 2021–2026 ledger that nets to
// a $0.00 cumulative change (so the balance stays exactly $650,000.00), pending
// transfers, notifications, login activity and support data.

import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "crypto";
import { DEMO_USER, DEMO_ACCOUNT, FARGO_ACCOUNT, BANK_NOVAPAY, BANK_FARGO } from "../src/lib/constants";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const prisma = new PrismaClient({ datasources: { db: { url } } });

// ---------------------------------------------------------------------------
// Deterministic pseudo-random generator (mulberry32)
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0x5eed2026);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const intBetween = (min: number, max: number) =>
  Math.round(min + rand() * (max - min));

// Deterministic "random" alpha codes for references
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function simCode(length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) out += CHARS[Math.floor(rand() * CHARS.length)];
  return out;
}
function txnRef(year: number): string {
  return `SIM-TXN-${year}-${simCode(6)}`;
}
function tktRef(): string {
  return `SIM-TKT-${simCode(5)}`;
}
function fargoTktRef(): string {
  return `FARG-TKT-${simCode(5)}`;
}

// ---------------------------------------------------------------------------
// Inline scrypt hashing (kept local so the seed runs without Next.js runtime).
// Produces the same `scrypt$salt$hash` format used by src/lib/auth.
// ---------------------------------------------------------------------------
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, buf) => (err ? reject(err) : resolve(buf)));
  })) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

// ---------------------------------------------------------------------------
// Ledger generation
// ---------------------------------------------------------------------------
interface TxSeed {
  type: string;
  amount: number; // signed
  recipientName: string;
  recipientReference?: string;
  recipientEmail?: string;
  description: string;
  category?: string;
  status?: "COMPLETED" | "PENDING";
  date: Date;
  reference: string;
  isFinalAdjuster?: boolean;
}

function dayInMonth(year: number, monthIndex: number, day: number, hour = 10): Date {
  return new Date(year, monthIndex, day, hour, intBetween(0, 59), intBetween(0, 59), 0);
}

const MONTHS: Array<{ year: number; month: number }> = [];
{
  let y = 2021;
  let m = 0;
  while (y < 2026 || (y === 2026 && m <= 8)) {
    MONTHS.push({ year: y, month: m });
    m += 1;
    if (m === 12) {
      m = 0;
      y += 1;
    }
  }
}
// 69 months: Jan 2021 … Sep 2026. The recurring ledger runs Feb 2021 → Aug 2026
// (i = 1…67); the target curve returns to exactly $650,000.00 at i = 67 so no
// artificial reconciliation entry is ever needed and nothing is dated in the future.
const CURVE_PERIOD = MONTHS.length - 2; // 67
const targetBalance = (i: number) =>
  Math.round(650000 + 42000 * Math.sin((2 * Math.PI * i) / CURVE_PERIOD));

const types: TxSeed[] = [];

for (let i = 1; i <= CURVE_PERIOD; i += 1) {
  const { year, month } = MONTHS[i];
  const prevIdx = i - 1;

  // --- Base recurring activity -------------------------------------------
  const raises = year - 2021;
  const salary = Math.round(6400 * Math.pow(1.03, raises) * 100) / 100;

  // Salary credit (pay day — 1st)
  types.push({
    type: "Deposit",
    amount: salary,
    recipientName: "Northstar Labs Inc.",
    recipientReference: "PAYROLL-NSTAR",
    description: "Monthly salary",
    category: "Salary",
    date: dayInMonth(year, month, 1, 9),
    reference: txnRef(year),
  });

  // Rent
  types.push({
    type: "Payment",
    amount: -2350,
    recipientName: "Hillside Apartments Mgmt",
    recipientReference: "HILLSIDE-226",
    description: "Apartment rent",
    category: "Rent",
    date: dayInMonth(year, month, 3, 8),
    reference: txnRef(year),
  });

  // Monthly savings pot transfer
  types.push({
    type: "Transfer",
    amount: -900,
    recipientName: "Savings Pot",
    recipientReference: "SAV-INTERNAL-01",
    recipientEmail: "savings@example.com",
    description: "Transfer to Savings Pot",
    category: "Savings",
    date: dayInMonth(year, month, 2, 12),
    reference: txnRef(year),
  });

  // Transportation
  types.push({
    type: "Payment",
    amount: -intBetween(82, 95),
    recipientName: "City Transit",
    description: "Monthly metro pass",
    category: "Transport",
    date: dayInMonth(year, month, 4, 7),
    reference: txnRef(year),
  });

  // Fuel (twice a month)
  types.push({
    type: "Payment",
    amount: -intBetween(38, 72),
    recipientName: "PetroMax",
    description: "Fuel",
    category: "Fuel",
    date: dayInMonth(year, month, 5, 17),
    reference: txnRef(year),
  });
  types.push({
    type: "Payment",
    amount: -intBetween(40, 75),
    recipientName: "PetroMax",
    description: "Fuel",
    category: "Fuel",
    date: dayInMonth(year, month, 19, 18),
    reference: txnRef(year),
  });

  // Utilities / electricity
  types.push({
    type: "Payment",
    amount: -intBetween(140, 260),
    recipientName: "City Power & Water",
    recipientReference: "UTIL-884201",
    description: "Electricity bill",
    category: "Utilities",
    date: dayInMonth(year, month, 8, 9),
    reference: txnRef(year),
  });

  // Groceries (a few card-style payments per month)
  const groceries = intBetween(2, 3);
  for (let g = 0; g < groceries; g += 1) {
    types.push({
      type: "Payment",
      amount: -intBetween(45, 190),
      recipientName: pick(["Fresh Market", "GreenGrocer"]),
      description: "Groceries",
      category: "Groceries",
      date: dayInMonth(year, month, intBetween(2, 27), 11),
      reference: txnRef(year),
    });
  }

  // Internet + mobile
  types.push({
    type: "Payment",
    amount: -54.99,
    recipientName: "Brightwave Internet",
    recipientReference: "NET-BW-8821",
    description: "Internet bill",
    category: "Internet",
    date: dayInMonth(year, month, 12, 9),
    reference: txnRef(year),
  });
  types.push({
    type: "Payment",
    amount: -intBetween(38, 55),
    recipientName: "CellCo Mobile",
    recipientReference: "ML-4471-X",
    description: "Mobile plan",
    category: "Mobile",
    date: dayInMonth(year, month, 14, 8),
    reference: txnRef(year),
  });

  // Streaming subscription
  types.push({
    type: "Payment",
    amount: -16.99,
    recipientName: "StreamHub",
    recipientReference: "SUB-SH-4471",
    description: "Streaming subscription",
    category: "Subscription",
    date: dayInMonth(year, month, 15, 6),
    reference: txnRef(year),
  });

  // Dining / restaurants
  const dining = intBetween(1, 2);
  for (let d = 0; d < dining; d += 1) {
    types.push({
      type: "Payment",
      amount: -intBetween(25, 85),
      recipientName: pick(["Café Nova", "Miso Ramen Bar", "Blue Paddle Grill", "The Copper Kitchen"]),
      description: "Restaurant — dinner",
      category: "Restaurant",
      date: dayInMonth(year, month, intBetween(3, 28), 18),
      reference: txnRef(year),
    });
  }

  // Online shopping
  const shopping = intBetween(1, 2);
  for (let s = 0; s < shopping; s += 1) {
    types.push({
      type: "Payment",
      amount: -intBetween(35, 220),
      recipientName: pick(["StoreZone", "MegaMart Online", "SwiftCart"]),
      description: "Online order",
      category: "Shopping",
      date: dayInMonth(year, month, intBetween(6, 24), 15),
      reference: txnRef(year),
    });
  }

  // Entertainment
  types.push({
    type: "Payment",
    amount: -intBetween(15, 48),
    recipientName: pick(["CinemaPlus", "Live Arena", "Arcade District"]),
    description: "Entertainment",
    category: "Entertainment",
    date: dayInMonth(year, month, intBetween(10, 25), 20),
    reference: txnRef(year),
  });

  // Insurance every other month
  if (i % 2 === 0) {
    types.push({
      type: "Payment",
      amount: -115,
      recipientName: "SecureLife Insurance",
      recipientReference: "POL-88002",
      description: "Insurance premium",
      category: "Insurance",
      date: dayInMonth(year, month, 12, 10),
      reference: txnRef(year),
    });
  }

  // Quarterly investment income
  if (i % 3 === 0) {
    types.push({
      type: "Deposit",
      amount: 1250,
      recipientName: "Northstar Funds",
      recipientReference: "FUND-IN-Q",
      description: "Dividend payout",
      category: "Investment",
      date: dayInMonth(year, month, 25, 10),
      reference: txnRef(year),
    });
  }

  // Occasional travel (flights + hotels every ~3rd month)
  if (i % 3 === 2) {
    types.push({
      type: "Payment",
      amount: -intBetween(340, 720),
      recipientName: "Skyline Airways",
      recipientReference: "FLT-NP-26",
      description: "Flight booking",
      category: "Travel",
      date: dayInMonth(year, month, 18, 8),
      reference: txnRef(year),
    });
    types.push({
      type: "Payment",
      amount: -intBetween(180, 420),
      recipientName: "Grand Harbor Hotel",
      recipientReference: "HTL-2291",
      description: "Hotel stay",
      category: "Travel",
      date: dayInMonth(year, month, 19, 15),
      reference: txnRef(year),
    });
  }

  // Occasional refund (every ~5th month)
  if (i % 5 === 0) {
    types.push({
      type: "Refund",
      amount: intBetween(40, 160),
      recipientName: "StoreZone",
      recipientReference: "RMA-4459",
      description: "Refund for returned item",
      category: "Refund",
      date: dayInMonth(year, month, intBetween(6, 20), 14),
      reference: txnRef(year),
    });
  }

  // --- Adjuster so the month closes exactly at the target balance ---------
  const baseNet = types
    .filter((t) => t.date >= new Date(year, month, 1) && t.date < new Date(year, month + 1, 1))
    .reduce((sum, t) => sum + t.amount, 0);
  const delta = targetBalance(i) - targetBalance(prevIdx);
  const adjuster = delta - baseNet;

  const isCredit = adjuster >= 0;
  const large = Math.abs(adjuster) >= 600;
  types.push({
    type: isCredit ? "Deposit" : "Withdrawal",
    amount: adjuster,
    recipientName: isCredit ? (large ? "Quarterly interest credit" : "Monthly interest credit") : "Account maintenance fee",
    description: isCredit
      ? large
        ? "Quarterly interest credited to your available balance"
        : "Interest credited to your available balance"
      : "Monthly account maintenance fee",
    category: isCredit ? "Interest" : "Fees",
    date: dayInMonth(year, month, 27, 23),
    reference: txnRef(year),
    ...(i === CURVE_PERIOD ? { isFinalAdjuster: true } : {}),
  });
}

// ---------------------------------------------------------------------------
// PENDING transactions (do not touch the available balance in the seed)
// ---------------------------------------------------------------------------
const today = new Date(2026, 8, 14, 10, 30); // fixed "seed day" for determinism

const pendingCredits = [
  { name: "InvoiceHub Inc.", ref: "INV-99231", amt: 1250, desc: "Client invoice settlement" },
  { name: "Northstar Labs Inc.", ref: "TAX-REFUND-26", amt: 942, desc: "Tax refund payout" },
  { name: "Online Marketplace", ref: "MKT-331098", amt: 310.5, desc: "Seller payout" },
].map((c, idx) => ({
  type: "Transfer",
  amount: c.amt,
  recipientName: c.name,
  recipientReference: c.ref,
  recipientEmail: "incoming@example.com",
  description: `${c.desc} — awaiting confirmation`,
  category: "Incoming",
  status: "PENDING" as const,
  date: new Date(2026, 8, 14 - idx * 1, 16, intBetween(0, 59)),
  reference: txnRef(2026),
}));

const pendingDebits = [
  { name: "Elena Rodriguez", ref: "SIM-ACC-009841", amt: 2500, desc: "Family transfer" },
  { name: "Green Earth Foundation", ref: "SIM-ACC-005512", amt: 150, desc: "Monthly donation" },
].map((c, idx) => ({
  type: "Transfer",
  amount: -c.amt,
  recipientName: c.name,
  recipientReference: c.ref,
  recipientEmail: "outgoing@example.com",
  description: `${c.desc} — awaiting approval`,
  category: "Transfer",
  status: "PENDING" as const,
  date: new Date(2026, 8, 13 - idx * 2, 15, intBetween(0, 59)),
  reference: txnRef(2026),
}));

const allTransactions: TxSeed[] = [...types, ...pendingCredits, ...pendingDebits];

// Round every amount to cents exactly as it will be stored.
const toCents = (n: number) => Math.round(n * 100) / 100;
const toDecimal = (n: number) => n.toFixed(2);

const txRows: TxSeed[] = allTransactions.map((t) => ({
  ...t,
  amount: toCents(t.amount),
}));

// Reconcile the COMPLETED ledger to a $0.00 net by nudging the final monthly
// interest adjuster by the (at most 1–2 cent) residual — the ledger stays
// natural, ends on the target curve, and the balance lands at exactly $650,000.00.
const finalAdjuster = txRows.find((t) => t.isFinalAdjuster);
let completedRows = txRows.filter((t) => t.status !== "PENDING");
let net = completedRows.reduce((sum, t) => sum + t.amount, 0);
if (net !== 0 && finalAdjuster) {
  finalAdjuster.amount = toCents(finalAdjuster.amount - net);
  finalAdjuster.isFinalAdjuster = false;
  net = 0;
  completedRows = txRows.filter((t) => t.status !== "PENDING");
}

// ---------------------------------------------------------------------------
// Running balances: every COMPLETED entry stores the ledger balance after it,
// starting from the $650,000.00 opening. PENDING rows keep the balance at the
// moment the transfer was created (the amount has not been applied yet).
// ---------------------------------------------------------------------------
const runningByRef = new Map<string, string>();
const completedSorted = completedRows
  .map((t, idx) => ({ t, idx }))
  .sort((a, b) => a.t.date.getTime() - b.t.date.getTime() || a.idx - b.idx);
let running = DEMO_ACCOUNT.initialBalance;
for (const { t } of completedSorted) {
  running = toCents(running + t.amount);
  runningByRef.set(t.reference, toDecimal(running));
}

const pendingBalanceByRef = new Map<string, string>();
const allSorted = allTransactions
  .map((t, idx) => ({ t, idx }))
  .sort((a, b) => a.t.date.getTime() - b.t.date.getTime() || a.idx - b.idx);
let running2 = DEMO_ACCOUNT.initialBalance;
for (const { t } of allSorted) {
  if (t.status === "PENDING") {
    pendingBalanceByRef.set(t.reference, toDecimal(running2));
  } else {
    running2 = toCents(running2 + t.amount);
  }
}

// ---------------------------------------------------------------------------
// Balance history snapshots (monthly target balances + final "today" value)
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding NovaPAY Bank demo database…");

  // Idempotent guard: if the demo user already exists, exit cleanly instead of
  // wiping or duplicating data. Use `npm run db:reset` (or `prisma migrate reset
  // --skip-seed` followed by an explicit seed) to rebuild a fresh database.
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
  });
  if (existingUser) {
    console.log("Seed skipped — demo user already exists. No data was changed.");
    return;
  }

  // Fresh reset has to remove the parent user last (cascades everything else).
  await prisma.supportMessage.deleteMany();
  await prisma.supportConversation.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.loginActivity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.balanceHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.internalTransfer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword(DEMO_USER.password);

  const user = await prisma.user.create({
    data: {
      firstName: DEMO_USER.firstName,
      lastName: DEMO_USER.lastName,
      email: DEMO_USER.email,
      passwordHash,
      phone: DEMO_USER.phone,
      twoFactorEnabled: false,
      biometricEnabled: false,
      securityNotificationsEnabled: true,
      transactionAlertsEnabled: true,
      accounts: {
        create: [
          {
            bank: BANK_NOVAPAY,
            type: DEMO_ACCOUNT.type,
            currency: DEMO_ACCOUNT.currency,
            accountNumber: DEMO_ACCOUNT.accountNumber,
            routingNumber: DEMO_ACCOUNT.routingNumber,
            status: DEMO_ACCOUNT.status,
            balance: toDecimal(DEMO_ACCOUNT.initialBalance),
          },
          {
            bank: BANK_FARGO,
            type: FARGO_ACCOUNT.type,
            currency: FARGO_ACCOUNT.currency,
            accountNumber: FARGO_ACCOUNT.accountNumber,
            routingNumber: FARGO_ACCOUNT.routingNumber,
            status: FARGO_ACCOUNT.status,
            balance: toDecimal(FARGO_ACCOUNT.initialBalance),
          },
        ],
      },
    },
  });

  const referenceSet = new Set<string>();
  for (const t of txRows) {
    if (referenceSet.has(t.reference)) throw new Error(`Duplicate reference: ${t.reference}`);
    referenceSet.add(t.reference);
  }

  await prisma.transaction.createMany({
    data: txRows.map((t) => ({
      userId: user.id,
      bank: BANK_NOVAPAY,
      transactionReference: t.reference,
      type: t.type,
      amount: toDecimal(t.amount),
      currency: "USD",
      recipientName: t.recipientName,
      recipientReference: t.recipientReference ?? null,
      recipientEmail: t.recipientEmail ?? null,
      description: t.description,
      category: t.category ?? null,
      status: t.status ?? "COMPLETED",
      createdAt: t.date,
      runningBalance: t.status === "PENDING" ? pendingBalanceByRef.get(t.reference) ?? null : runningByRef.get(t.reference) ?? null,
    })),
  });

  // Balance history: monthly closings (target curve) ending exactly $650,000.00.
  const snapshots: Array<{ date: Date; balance: string }> = [];
  for (let i = 0; i <= CURVE_PERIOD; i += 1) {
    const { year, month } = MONTHS[i];
    snapshots.push({
      date: new Date(year, month, 1, 0, 0, 0, 0),
      balance: toDecimal(targetBalance(i)),
    });
  }
  // Push a final snapshot at the seed day so the chart reaches $650,000.00 today.
  if (snapshots[snapshots.length - 1].date.getTime() !== today.getTime()) {
    snapshots.push({ date: today, balance: toDecimal(DEMO_ACCOUNT.initialBalance) });
  }
  await prisma.balanceHistory.createMany({
    data: snapshots.map((s) => ({ userId: user.id, bank: BANK_NOVAPAY, date: s.date, balance: s.balance })),
  });

  // Notifications
  const notifications: Array<{
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: Date;
    bank?: string;
  }> = [
    {
      title: "Welcome to NovaPAY Bank",
      message: "Your Premium Dollar Checking account is ready.",
      type: "system",
      read: true,
      createdAt: new Date(2024, 2, 4, 9, 0),
    },
    {
      title: "Transfer Pending",
      message: "Your transfer of $2,500.00 to Elena Rodriguez is pending and reserved from your available balance.",
      type: "transfer",
      read: false,
      createdAt: new Date(2026, 8, 13, 15, 10),
    },
    {
      title: "Transfer Pending",
      message: "Your transfer of $150.00 to Green Earth Foundation is pending and reserved from your available balance.",
      type: "transfer",
      read: false,
      createdAt: new Date(2026, 8, 11, 9, 45),
    },
    {
      title: "Incoming credit",
      message: "A credit of $1,250.00 from InvoiceHub Inc. is being processed.",
      type: "credit",
      read: false,
      createdAt: new Date(2026, 8, 13, 8, 0),
    },
    {
      title: "Monthly statement available",
      message: "Your statement for August 2026 is ready to review on the Transactions page.",
      type: "reminder",
      read: true,
      createdAt: new Date(2026, 8, 3, 6, 0),
    },
    {
      title: "Security alert",
      message: "A new sign-in was detected from Chrome on Windows. If this was you, no action is needed.",
      type: "security",
      read: true,
      createdAt: new Date(2026, 8, 1, 12, 30),
    },
    {
      title: "Transfer completed",
      message: "Your transfer to Northstar Funds of $1,250.00 has been marked as completed in the ledger.",
      type: "transfer",
      read: true,
      createdAt: new Date(2026, 7, 25, 11, 0),
    },
    {
      title: "Balance goal reached",
      message: "Your balance crossed the $640,000.00 mark.",
      type: "reminder",
      read: true,
      createdAt: new Date(2026, 7, 15, 18, 20),
    },
    {
      title: "Welcome to Fargo",
      message:
        "Your Digital Checking Account is ready with a $0.00 opening balance. Transfer funds in from NovaPAY to get started.",
      type: "system",
      read: false,
      bank: BANK_FARGO,
      createdAt: new Date(2026, 8, 14, 10, 40),
    },
  ];
  await prisma.notification.createMany({
    data: notifications.map((n) => ({
      userId: user.id,
      bank: n.bank ?? BANK_NOVAPAY,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
    })),
  });

  // Login activity
  const activity = [
    { event: "REGISTER", ip: "192.0.2.1", userAgent: "Chrome on Windows", date: new Date(2024, 2, 4, 9, 5) },
    { event: "LOGIN_SUCCESS", ip: "192.0.2.1", userAgent: "Chrome on Windows", date: new Date(2024, 2, 4, 9, 6) },
    { event: "LOGIN_SUCCESS", ip: "192.0.2.1", userAgent: "Safari on macOS", date: new Date(2025, 5, 17, 14, 20) },
    { event: "LOGIN_SUCCESS", ip: "192.0.2.1", userAgent: "Chrome on Windows", date: new Date(2026, 7, 1, 8, 10) },
    { event: "LOGIN_FAILED", ip: "192.0.2.1", userAgent: "Firefox on Windows", date: new Date(2026, 7, 20, 22, 55) },
    { event: "LOGIN_SUCCESS", ip: "192.0.2.1", userAgent: "Chrome on Windows", date: new Date(2026, 8, 1, 12, 30) },
    { event: "LOGIN_SUCCESS", ip: "192.0.2.1", userAgent: "Chrome on Windows", date: new Date(2026, 8, 14, 10, 35) },
  ];
  await prisma.loginActivity.createMany({
    data: activity.map((a) => ({ userId: user.id, event: a.event, ip: a.ip, userAgent: a.userAgent, createdAt: a.date })),
  });

  // Support conversations
  const conversation = await prisma.supportConversation.create({
    data: {
      userId: user.id,
      bank: BANK_NOVAPAY,
      subject: "Wondering about a pending transfer",
      agentName: "Sarah — Northstar Support",
      status: "OPEN",
    },
  });

  const fargoConversation = await prisma.supportConversation.create({
    data: {
      userId: user.id,
      bank: BANK_FARGO,
      subject: "How do pending payments work in Fargo?",
      agentName: "Jordan — Fargo Support",
      status: "OPEN",
    },
  });

  const convoMessages = [
    {
      senderRole: "user",
      senderName: "Michael Anderson",
      body: "Hi! I created a transfer to Elena Rodriguez and it still shows as pending. What happens next?",
      createdAt: new Date(2026, 8, 13, 15, 20),
    },
    {
      senderRole: "agent",
      senderName: "Sarah — Northstar Support",
      body: "Hello Michael. The transfer you see is currently marked as PENDING. That means the amount is reserved within your available balance but has not yet been settled.",
      createdAt: new Date(2026, 8, 13, 15, 24),
    },
    {
      senderRole: "user",
      senderName: "Michael Anderson",
      body: "Got it, thanks!",
      createdAt: new Date(2026, 8, 13, 15, 30),
    },
    {
      senderRole: "agent",
      senderName: "Sarah — Northstar Support",
      body: "You're welcome, Michael! I'm glad I could help. Is there anything else you'd like to know?",
      createdAt: new Date(2026, 8, 13, 15, 31),
    },
  ];
  await prisma.supportMessage.createMany({
    data: convoMessages.map((m) => ({
      conversationId: conversation.id,
      userId: m.senderRole === "user" ? user.id : null,
      senderRole: m.senderRole,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt,
    })),
  });

  const fargoConvoMessages = [
    {
      senderRole: "user",
      senderName: "Michael Anderson",
      body: "Hi! I just created my first Fargo payment and it shows as PENDING. Is that normal?",
      createdAt: new Date(2026, 8, 14, 11, 5),
    },
    {
      senderRole: "agent",
      senderName: "Jordan — Fargo Support",
      body: "Hi Michael. Yes, that's expected. Every Fargo payment is created with a PENDING status, meaning the amount is reserved from your available balance but not yet settled.",
      createdAt: new Date(2026, 8, 14, 11, 8),
    },
    {
      senderRole: "user",
      senderName: "Michael Anderson",
      body: "Clear, thanks Jordan!",
      createdAt: new Date(2026, 8, 14, 11, 12),
    },
  ];
  await prisma.supportMessage.createMany({
    data: fargoConvoMessages.map((m) => ({
      conversationId: fargoConversation.id,
      userId: m.senderRole === "user" ? user.id : null,
      senderRole: m.senderRole,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt,
    })),
  });

  // Support tickets
  await prisma.supportTicket.createMany({
    data: [
      {
        ticketReference: tktRef(),
        userId: user.id,
        bank: BANK_NOVAPAY,
        subject: "Question about pending transfers",
        category: "Transfer",
        description:
          "I created a transfer and it still shows as pending. I'd like to understand how the reserved amount is displayed on the dashboard.",
        priority: "Medium",
        status: "Open",
        createdAt: new Date(2026, 8, 13, 16, 0),
      },
      {
        ticketReference: tktRef(),
        userId: user.id,
        bank: BANK_NOVAPAY,
        subject: "Update contact phone number",
        category: "Account",
        description: "Please update the phone number on my profile.",
        priority: "Low",
        status: "Resolved",
        createdAt: new Date(2026, 7, 10, 9, 0),
      },
      {
        ticketReference: fargoTktRef(),
        userId: user.id,
        bank: BANK_FARGO,
        subject: "How far back does Fargo balance history go?",
        category: "Account",
        description:
          "Since Fargo starts at $0.00, I'd like to confirm that balance history only reflects activity after I started using the environment.",
        priority: "Low",
        status: "Open",
        createdAt: new Date(2026, 8, 14, 10, 55),
      },
    ],
  });

  const completed = txRows.filter((t) => t.status !== "PENDING");
  console.log("Seed complete.");
  console.log(`  User: ${DEMO_USER.firstName} ${DEMO_USER.lastName} <${DEMO_USER.email}>`);
  console.log(`  NovaPAY account: ${DEMO_ACCOUNT.accountNumber} · ${DEMO_ACCOUNT.type}`);
  console.log(`  NovaPAY available balance: $${DEMO_ACCOUNT.initialBalance.toLocaleString()}.00 (simulated)`);
  console.log(`  Final NovaPAY running balance (ledger): $${toDecimal(running)}`);
  console.log(`  COMPLETED transactions: ${completed.length} (net change: $${net})`);
  console.log(`  PENDING transactions: ${txRows.length - completed.length}`);
  console.log(`  Balance snapshots: ${snapshots.length}`);
  console.log(`  Notifications: ${notifications.length}`);
  console.log(`  Fargo account: ${FARGO_ACCOUNT.accountNumber} · ${FARGO_ACCOUNT.type}`);
  console.log(`  Fargo available balance: $${FARGO_ACCOUNT.initialBalance.toFixed(2)} (simulated)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });