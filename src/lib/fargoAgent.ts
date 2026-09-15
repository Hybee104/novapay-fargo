// Simulated support agent for the Fargo banking environment.
// Keyword-driven scripted replies stored only in the application database.

type Category =
  | "pending"
  | "transfer"
  | "account"
  | "payment"
  | "balance"
  | "security"
  | "greeting"
  | "thanks"
  | "help"
  | "general";

interface Rule {
  keywords: RegExp;
  category: Category;
}

const RULES: Rule[] = [
  { keywords: /pending|reserved|when.*(complete|clear)|awaiting/i, category: "pending" },
  { keywords: /novapay|internal transfer|move.*money|from novapay/i, category: "transfer" },
  { keywords: /payment|pay bill|recipient|category/i, category: "payment" },
  { keywords: /login|sign\s?in|password|locked|forgot/i, category: "security" },
  { keywords: /balance|how much|funds|insufficient|spent|available/i, category: "balance" },
  { keywords: /security|fraud|scam|2fa|two.?factor|unauthorized/i, category: "security" },
  { keywords: /account|profile|details|number|routing|fargo/i, category: "account" },
  { keywords: /\bhi\b|\bhello\b|\bhey\b|\bgood (morning|afternoon|evening)\b/i, category: "greeting" },
  { keywords: /\bthanks\b|\bthank you\b|\bthx\b/i, category: "thanks" },
  { keywords: /\bhelp\b|\bsupport\b|\bassist\b/i, category: "help" },
];

const REPLIES: Record<Category, (name: string) => string> = {
  pending: (name) =>
    `Hello ${name}. Fargo payments are created as PENDING automatically. That means the amount is reserved from your available balance but has not been settled. Payments stay pending until the simulated transaction-status logic advances them — no real money is involved.`,
  transfer: (name) =>
    `Hi ${name}. Transfers into Fargo come from the linked NovaPAY demo account through an internal, in-app transfer. Both sides are recorded atomically in the local database — the NovaPAY balance decreases and the Fargo balance increases by exactly the same amount. Nothing leaves this application.`,
  payment: (name) =>
    `Sure, ${name}. On the Payments page you can enter a recipient, description, amount and category. When submitted, the payment is validated against your available Fargo balance and stored with a PENDING status. It never leaves the application.`,
  balance: (name) =>
    `Hi ${name}. Your available Fargo balance is computed from the ledger inside this application. It starts at $0.00, increases when funds are transferred in from NovaPAY, and decreases when pending payments are reserved. This is a simulation — no real money is involved.`,
  account: (name) =>
    `Of course, ${name}. Your Fargo account is a "Simulated Digital Checking" account in USD. The account number (FARG-9231-XXXX) and routing number (DEMO-ROUTING-F) are fictional placeholders, not tied to any real institution.`,
  security: (name) =>
    `Hello ${name}. Fargo is protected by the same demo authentication as NovaPAY — signed session cookies and hashed passwords stored only in the local database. No external financial or authentication service is used.`,
  greeting: (name) =>
    `Hello ${name}, thanks for reaching out! I'm Jordan from Fargo support. I can help with payments, pending transactions, internal transfers from NovaPAY, or your Fargo balance. How can I help?`,
  thanks: (name) =>
    `You're welcome, ${name}! I'm glad I could help. Is there anything else you'd like to know?`,
  help: (name) =>
    `Of course, ${name}. I can help with topics like pending payments, internal NovaPAY transfers, your Fargo balance, and account details. What would you like to know?`,
  general: (name) =>
    `Thanks for your message, ${name}. I'm a simulated support assistant for the Fargo demo — no real banking systems are involved. Feel free to ask about payments, transfers, your balance, or account settings.`,
};

export function simulateFargoReply(firstName: string, message: string): string {
  let category: Category = "general";
  for (const rule of RULES) {
    if (rule.keywords.test(message)) {
      category = rule.category;
      break;
    }
  }
  return REPLIES[category](firstName);
}

export const FARGO_AGENT_PROFILE = {
  displayName: "Jordan — Fargo Support",
  role: "Simulated Support Agent",
  online: true,
  avatarColor: "#0f766e",
};