// ---------------------------------------------------------------------------
// SIMULATED DEMO DATA
//
// Generates a fictional transaction history for accounts created through the
// admin dashboard. Every value produced here is invented demo content for the
// NovaPAY-Fargo sandbox. It is marked as simulated the same way the rest of the
// application marks it: transaction references are prefixed `SIM-`.
//
// Reconciliation contract
// -----------------------
// The generator produces a ledger that lands on exactly `OPENING_BALANCE_CENTS`
// ($2,350,000.00) and nothing else is required to fix it up afterwards:
//
//   1. Every activity entry is generated first, in whole cents.
//   2. `netCents` = the signed sum of all activity entries.
//   3. A single "initial funding" deposit is prepended for
//      `OPENING_BALANCE_CENTS - netCents`.
//   4. Walking the ledger chronologically therefore ends on the target exactly.
//
// Because every amount is an integer number of cents there is no floating-point
// drift, so the final running balance is exact to the cent. The same walk also
// produces each entry's `runningBalance` and the monthly balance-history
// snapshots used by the balance-history chart.
// ---------------------------------------------------------------------------

/** Final (and only) opening balance for an admin-created account: $2,350,000.00 */
export const OPENING_BALANCE_CENTS = 235_000_000;

/** History begins in January 2019. */
export const HISTORY_START_YEAR = 2019;
export const HISTORY_START_MONTH = 0; // January (0-indexed)

export type GeneratedTransaction = {
  /** Unique, and prefixed `SIM-` so the row is identifiable as demo data. */
  transactionReference: string;
  type: string;
  /** Signed, in dollars. Credits positive, debits negative. */
  amount: number;
  currency: string;
  recipientName: string;
  recipientReference: string | null;
  recipientEmail: string | null;
  description: string;
  category: string;
  status: string;
  date: Date;
  /** Exact decimal string of the balance after this entry (PENDING rows: before). */
  runningBalance: string;
};

export type GeneratedBalancePoint = { date: Date; balance: string };

export type GeneratedHistory = {
  transactions: GeneratedTransaction[];
  balanceHistory: GeneratedBalancePoint[];
  /** Exact cents of the ledger's final balance — always OPENING_BALANCE_CENTS. */
  finalBalanceCents: number;
  /** Exact cents of the prepended initial funding deposit. */
  initialFundingCents: number;
};

// ---- deterministic pseudo-randomness ---------------------------------------

type Rng = () => number;

/** FNV-1a, so each account gets its own stable but different history. */
function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const intBetween = (r: Rng, min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;
const pick = <T,>(r: Rng, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)]!;
const chance = (r: Rng, probability: number) => r() < probability;

const toCents = (dollars: number) => Math.round(dollars * 100);
const toDecimal = (c: number) => (c / 100).toFixed(2);

// ---- vocabulary -------------------------------------------------------------

const EMPLOYERS = [
  "Northstar Labs Inc.",
  "Cobalt Analytics Group",
  "Meridian Health Partners",
  "Halcyon Design Studio",
  "Brightline Robotics",
] as const;

const COUNTERPARTIES = [
  "Hillside Apartments Mgmt",
  "Fairview Property Group",
  "Riverside Condo Association",
] as const;

const GROCERS = ["Fresh Market", "GreenGrocer", "Sunrise Foods", "Harvest Pantry"] as const;
const RESTAURANTS = ["Copper Kettle", "Nori & Co", "The Olive Branch", "Rye & Ember"] as const;
const FUEL_STOPS = ["PetroMax", "Vantage Fuel", "Northgate Gas"] as const;
const TRANSIT = ["City Transit", "MetroLink", "Regional Rail"] as const;
const RETAIL = ["Atlas Outfitters", "Lumen Electronics", "Verdant Home", "Trailhead Supply"] as const;
const AIRLINES = ["Skylark Airways", "Meridian Air"] as const;
const HOTELS = ["Harbour Grand", "The Wexford", "Cedar Lodge"] as const;
const TRANSFER_COUNTERPARTIES = [
  "Blackwood Capital",
  "Ironbridge Ventures",
  "Sable & Co Partners",
  "Quarry Holdings",
] as const;
const BROKERAGES = ["Ashford Securities", "Keystone Investments"] as const;
const CHARITIES = ["Riverbend Food Bank", "Open Doors Foundation", "City Land Trust"] as const;
const HOME_SERVICES = ["HandyPro Services", "Bright Home Care", "Keystone Maintenance"] as const;

// ---- generation -------------------------------------------------------------

type Draft = {
  type: string;
  amountCents: number;
  recipientName: string;
  recipientReference: string | null;
  recipientEmail: string | null;
  description: string;
  category: string;
  date: Date;
};

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function makeReference(r: Rng, used: Set<string>, year: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 40; attempt += 1) {
    let code = "";
    for (let i = 0; i < 6; i += 1) code += alphabet[intBetween(r, 0, alphabet.length - 1)];
    const ref = `SIM-TXN-${year}-${code}`;
    if (!used.has(ref)) {
      used.add(ref);
      return ref;
    }
  }
  // Astronomically unlikely fallback; keeps the unique constraint satisfiable.
  const ref = `SIM-TXN-${year}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  used.add(ref);
  return ref;
}

export function generateHistory(seedText: string, now: Date = new Date()): GeneratedHistory {
  const r = mulberry32(seedFrom(seedText));
  const usedRefs = new Set<string>();
  const drafts: Draft[] = [];

  const endYear = now.getFullYear();
  const endMonth = now.getMonth();

  // Walk every month from January 2019 up to and including the current month.
  // The month cursor is advanced at the *end* of the body so that wrapping
  // December -> January can't skip a month.
  let y = HISTORY_START_YEAR;
  let m = HISTORY_START_MONTH;
  for (;;) {
    const isCurrentMonth = y === endYear && m === endMonth;
    const lastDay = isCurrentMonth ? now.getDate() : daysInMonth(y, m);

    const at = (day: number, hour: number) =>
      new Date(y, m, Math.min(day, lastDay), hour, intBetween(r, 0, 59), intBetween(r, 0, 59), 0);

    const yearsIn = y - HISTORY_START_YEAR;
    // Steady ~2% annual income growth keeps the curve natural over 7+ years.
    const salary = 15800 * Math.pow(1.02, yearsIn);

    // ---- credits ----
    drafts.push({
      type: "Deposit",
      amountCents: toCents(salary),
      recipientName: pick(r, EMPLOYERS),
      recipientReference: `PAYROLL-${intBetween(r, 1000, 9999)}`,
      recipientEmail: null,
      description: "Monthly salary",
      category: "Salary",
      date: at(1, 9),
    });

    if (chance(r, 0.45)) {
      drafts.push({
        type: "Deposit",
        amountCents: toCents(intBetween(r, 900, 6500)),
        recipientName: pick(r, BROKERAGES),
        recipientReference: `DIV-${intBetween(r, 10000, 99999)}`,
        recipientEmail: null,
        description: pick(r, ["Dividend distribution", "Interest credited", "Brokerage distribution"]),
        category: "Investment",
        date: at(intBetween(r, 3, 26), 10),
      });
    }

    if (chance(r, 0.18)) {
      drafts.push({
        type: "Transfer",
        amountCents: toCents(intBetween(r, 1500, 24000)),
        recipientName: pick(r, TRANSFER_COUNTERPARTIES),
        recipientReference: `SIM-IN-${intBetween(r, 100000, 999999)}`,
        recipientEmail: "transfers@example.com",
        description: "Incoming transfer",
        category: "Incoming",
        date: at(intBetween(r, 2, 27), 11),
      });
    }

    if (chance(r, 0.35)) {
      drafts.push({
        type: "Refund",
        amountCents: toCents(intBetween(r, 40, 780)),
        recipientName: pick(r, RETAIL),
        recipientReference: `REF-${intBetween(r, 10000, 99999)}`,
        recipientEmail: null,
        description: pick(r, ["Purchase refund", "Returned item", "Price adjustment"]),
        category: "Refund",
        date: at(intBetween(r, 2, 27), 13),
      });
    }

    // ---- debits ----
    drafts.push({
      type: "Payment",
      amountCents: -toCents(4350),
      recipientName: pick(r, COUNTERPARTIES),
      recipientReference: `LEASE-${intBetween(r, 1000, 9999)}`,
      recipientEmail: null,
      description: "Monthly rent",
      category: "Rent",
      date: at(3, 8),
    });

    drafts.push({
      type: "Transfer",
      amountCents: -toCents(intBetween(r, 1200, 4000)),
      recipientName: pick(r, BROKERAGES),
      recipientReference: `SIM-BUY-${intBetween(r, 100000, 999999)}`,
      recipientEmail: "brokerage@example.com",
      description: "Investment contribution",
      category: "Investment",
      date: at(intBetween(r, 4, 26), 12),
    });

    drafts.push({
      type: "Payment",
      amountCents: -toCents(1180),
      recipientName: "Sentinel Insurance Co.",
      recipientReference: `POL-${intBetween(r, 100000, 999999)}`,
      recipientEmail: null,
      description: "Insurance premium",
      category: "Insurance",
      date: at(6, 9),
    });

    for (let s = 0, n = intBetween(r, 1, 3); s < n; s += 1) {
      drafts.push({
        type: "Payment",
        amountCents: -toCents(intBetween(r, 14, 29)),
        recipientName: pick(r, ["Streamline Media", "Cloudline", "FitTrack", "Readly", "TuneBox"]),
        recipientReference: `SIM-SUB-${intBetween(r, 1000, 9999)}`,
        recipientEmail: null,
        description: "Subscription renewal",
        category: "Subscription",
        date: at(intBetween(r, 5, 27), 7),
      });
    }

    for (let g = 0, n = intBetween(r, 2, 3); g < n; g += 1) {
      drafts.push({
        type: "Payment",
        amountCents: -toCents(intBetween(r, 150, 430)),
        recipientName: pick(r, GROCERS),
        recipientReference: null,
        recipientEmail: null,
        description: "Groceries",
        category: "Groceries",
        date: at(intBetween(r, 2, 27), 11),
      });
    }

    for (let d = 0, n = intBetween(r, 2, 4); d < n; d += 1) {
      drafts.push({
        type: "Payment",
        amountCents: -toCents(intBetween(r, 65, 310)),
        recipientName: pick(r, RESTAURANTS),
        recipientReference: null,
        recipientEmail: null,
        description: pick(r, ["Dining", "Coffee and breakfast", "Takeaway", "Client lunch"]),
        category: "Restaurant",
        date: at(intBetween(r, 2, 27), 19),
      });
    }

    for (let t = 0, n = intBetween(r, 1, 2); t < n; t += 1) {
      drafts.push({
        type: "Payment",
        amountCents: -toCents(intBetween(r, 110, 420)),
        recipientName: pick(r, TRANSIT),
        recipientReference: `PASS-${intBetween(r, 10000, 99999)}`,
        recipientEmail: null,
        description: pick(r, ["Transit pass", "Rail ticket", "Rideshare"]),
        category: "Transport",
        date: at(intBetween(r, 2, 27), 8),
      });
    }

    for (let f = 0, n = intBetween(r, 1, 2); f < n; f += 1) {
      drafts.push({
        type: "Payment",
        amountCents: -toCents(intBetween(r, 38, 78)),
        recipientName: pick(r, FUEL_STOPS),
        recipientReference: null,
        recipientEmail: null,
        description: "Fuel",
        category: "Fuel",
        date: at(intBetween(r, 2, 27), 18),
      });
    }

    drafts.push({
      type: "Payment",
      amountCents: -toCents(intBetween(r, 190, 430)),
      recipientName: "City Power & Water",
      recipientReference: `UTIL-${intBetween(r, 100000, 999999)}`,
      recipientEmail: null,
      description: pick(r, ["Electricity bill", "Water and sewer", "Utility bill"]),
      category: "Utilities",
      date: at(8, 9),
    });

    drafts.push({
      type: "Payment",
      amountCents: -89,
      recipientName: "Lumen Fiber Internet",
      recipientReference: `ISP-${intBetween(r, 10000, 99999)}`,
      recipientEmail: null,
      description: "Broadband internet",
      category: "Internet",
      date: at(10, 9),
    });

    drafts.push({
      type: "Payment",
      amountCents: -78,
      recipientName: "Kestrel Mobile",
      recipientReference: `MOB-${intBetween(r, 10000, 99999)}`,
      recipientEmail: null,
      description: "Mobile plan",
      category: "Mobile",
      date: at(11, 9),
    });

    drafts.push({
      type: "Payment",
      amountCents: -toCents(intBetween(r, 250, 900)),
      recipientName: pick(r, HOME_SERVICES),
      recipientReference: null,
      recipientEmail: null,
      description: pick(r, ["Home maintenance", "Plumbing repair", "Lawn and upkeep"]),
      category: "Account",
      date: at(intBetween(r, 12, 26), 14),
    });

    if (chance(r, 0.7)) {
      for (let s = 0, n = intBetween(r, 1, 2); s < n; s += 1) {
        drafts.push({
          type: "Payment",
          amountCents: -toCents(intBetween(r, 85, 760)),
          recipientName: pick(r, RETAIL),
          recipientReference: null,
          recipientEmail: null,
          description: pick(r, ["Household purchase", "Clothing", "Electronics", "Home goods"]),
          category: "Shopping",
          date: at(intBetween(r, 12, 27), 15),
        });
      }
    }

    if (chance(r, 0.5)) {
      drafts.push({
        type: "Payment",
        amountCents: -toCents(intBetween(r, 100, 600)),
        recipientName: pick(r, CHARITIES),
        recipientReference: `GIFT-${intBetween(r, 1000, 9999)}`,
        recipientEmail: null,
        description: "Charitable giving",
        category: "Account",
        date: at(intBetween(r, 12, 27), 16),
      });
    }

    if (chance(r, 0.15)) {
      const trip = intBetween(r, 1600, 7200);
      drafts.push({
        type: "Payment",
        amountCents: -toCents(Math.round(trip * 0.62)),
        recipientName: pick(r, AIRLINES),
        recipientReference: `TKT-${intBetween(r, 100000, 999999)}`,
        recipientEmail: null,
        description: "Flight booking",
        category: "Travel",
        date: at(intBetween(r, 4, 24), 10),
      });
      drafts.push({
        type: "Payment",
        amountCents: -toCents(trip - Math.round(trip * 0.62)),
        recipientName: pick(r, HOTELS),
        recipientReference: `STAY-${intBetween(r, 100000, 999999)}`,
        recipientEmail: null,
        description: "Lodging",
        category: "Travel",
        date: at(intBetween(r, 4, 24), 11),
      });
    }

    if (chance(r, 0.45)) {
      drafts.push({
        type: "Withdrawal",
        amountCents: -toCents(intBetween(r, 200, 800)),
        recipientName: pick(r, ["ATM withdrawal", "NovaPAY ATM", "Cash point"]),
        recipientReference: `ATM-${intBetween(r, 10000, 99999)}`,
        recipientEmail: null,
        description: "Cash withdrawal",
        category: "Account",
        date: at(intBetween(r, 12, 27), 17),
      });
    }

    if (chance(r, 0.15)) {
      drafts.push({
        type: "Transfer",
        amountCents: -toCents(intBetween(r, 1500, 18000)),
        recipientName: pick(r, TRANSFER_COUNTERPARTIES),
        recipientReference: `SIM-OUT-${intBetween(r, 100000, 999999)}`,
        recipientEmail: "transfers@example.com",
        description: "Outgoing transfer",
        category: "Transfer",
        date: at(intBetween(r, 12, 27), 12),
      });
    }

    if (chance(r, 0.55)) {
      drafts.push({
        type: "Payment",
        amountCents: -toCents(intBetween(r, 12, 45)),
        recipientName: "NovaPAY Bank",
        recipientReference: `CHG-${intBetween(r, 100000, 999999)}`,
        recipientEmail: null,
        description: pick(r, ["Monthly account fee", "Account maintenance charge", "Service charge"]),
        category: "Account",
        date: at(intBetween(r, 20, 27), 6),
      });
    }

    if (isCurrentMonth) break;
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }

  // Guarantee the ledger runs right up to the current date: one small completed
  // entry dated today, so the newest transaction is never stale.
  drafts.push({
    type: "Deposit",
    amountCents: toCents(intBetween(r, 120, 900)),
    recipientName: "NovaPAY Bank",
    recipientReference: `INT-${intBetween(r, 100000, 999999)}`,
    recipientEmail: null,
    description: "Interest credited",
    category: "Investment",
    date: new Date(now.getTime()),
  });

  // Net of everything except the opening deposit, in exact cents.
  const netCents = drafts.reduce((sum, d) => sum + d.amountCents, 0);
  const initialFundingCents = OPENING_BALANCE_CENTS - netCents;

  const opening: Draft = {
    type: "Deposit",
    amountCents: initialFundingCents,
    recipientName: "NovaPAY Bank",
    recipientReference: `OPEN-${intBetween(r, 100000, 999999)}`,
    recipientEmail: null,
    description: "Opening account funding",
    category: "Transfer",
    // Midnight on the first day, ahead of every generated activity entry (the
    // earliest of which is 06:00), so this is always the ledger's first row.
    date: new Date(HISTORY_START_YEAR, HISTORY_START_MONTH, 1, 0, 0, 0, 0),
  };

  const all = [opening, ...drafts].sort(
    (a, b) => a.date.getTime() - b.date.getTime() || a.amountCents - b.amountCents,
  );

  // ---- two recent PENDING entries (reserved, not yet applied) ---------------
  // PENDING rows deliberately do NOT move the ledger, which also gives the
  // pending-transaction support flow something real to explain.
  const pendingYear = now.getFullYear();
  const pending: GeneratedTransaction[] = [
    {
      transactionReference: makeReference(r, usedRefs, pendingYear),
      type: "Transfer",
      amount: -toCents(intBetween(r, 450, 3200)) / 100,
      currency: "USD",
      recipientName: pick(r, TRANSFER_COUNTERPARTIES),
      recipientReference: `SIM-PEND-${intBetween(r, 100000, 999999)}`,
      recipientEmail: "transfers@example.com",
      description: "Outgoing transfer",
      category: "Transfer",
      status: "PENDING",
      date: new Date(now.getTime() - 2 * 864e5),
      runningBalance: "0.00",
    },
    {
      transactionReference: makeReference(r, usedRefs, pendingYear),
      type: "Deposit",
      amount: toCents(intBetween(r, 300, 2400)) / 100,
      currency: "USD",
      recipientName: pick(r, EMPLOYERS),
      recipientReference: `PAYROLL-PEND-${intBetween(r, 1000, 9999)}`,
      recipientEmail: null,
      description: "Incoming payroll transfer",
      category: "Incoming",
      status: "PENDING",
      date: new Date(now.getTime() - 864e5),
      runningBalance: "0.00",
    },
  ];

  // ---- walk the ledger: running balances + monthly snapshots ----------------
  const transactions: GeneratedTransaction[] = [];
  const monthEnd = new Map<string, { date: Date; balance: string }>();
  let running = 0;

  for (const d of all) {
    running += d.amountCents;
    const balance = toDecimal(running);
    transactions.push({
      transactionReference: makeReference(r, usedRefs, d.date.getFullYear()),
      type: d.type,
      amount: d.amountCents / 100,
      currency: "USD",
      recipientName: d.recipientName,
      recipientReference: d.recipientReference,
      recipientEmail: d.recipientEmail,
      description: d.description,
      category: d.category,
      status: "COMPLETED",
      date: d.date,
      runningBalance: balance,
    });

    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    monthEnd.set(key, { date: d.date, balance });
  }

  for (const p of pending) p.runningBalance = toDecimal(running);
  transactions.push(...pending);

  const balanceHistory: GeneratedBalancePoint[] = [...monthEnd.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Final snapshot lands on today, mirroring the seeded demo account.
  const last = balanceHistory[balanceHistory.length - 1];
  if (!last || last.date.toDateString() !== now.toDateString()) {
    balanceHistory.push({ date: new Date(now.getTime()), balance: toDecimal(running) });
  }

  return {
    transactions,
    balanceHistory,
    finalBalanceCents: running,
    initialFundingCents,
  };
}
