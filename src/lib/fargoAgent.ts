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
    `Hello ${name}. Thanks for checking in — your Fargo payment is marked as PENDING, which means it has been accepted and the amount is reserved from your available balance but has not yet settled. ` +
    `Settlement normally completes within one to two business days, and the most common reasons it takes a little longer are: ` +
    `the sending bank is still batching the payment, the recipient's bank is taking extra time to process it, ` +
    `the payment is held for a routine verification or compliance review, or it is waiting in our processing queue during a busy period. ` +
    `The reservation is released automatically once the payment completes or is returned, and there's nothing you need to send or pay to move it along. ` +
    `You'll be notified as soon as the status changes. If it's still pending after three business days, send me the date and amount and I'll look into it further.`,
  transfer: (name) =>
    `Hi ${name}. Transfers into Fargo come from your linked NovaPAY account through an internal transfer. Both sides are recorded together in your account — the NovaPAY balance decreases and the Fargo balance increases by exactly the same amount.`,
  payment: (name) =>
    `Sure, ${name}. On the Payments page you can enter a recipient, description, amount and category. When submitted, the payment is validated against your available Fargo balance and stored with a PENDING status.`,
  balance: (name) =>
    `Hi ${name}. Your available Fargo balance is computed from the ledger in your account. It starts at $0.00, increases when funds are transferred in from NovaPAY, and is reduced when pending payments are reserved.`,
  account: (name) =>
    `Of course, ${name}. Your Fargo account is a "Digital Checking" account in USD. The account number is 9231-XXXX and the routing number is 084000036.`,
  security: (name) =>
    `Hello ${name}. Fargo is protected with signed session cookies and hashed passwords stored securely. No external financial or authentication service is used.`,
  greeting: (name) =>
    `Hello ${name}, thanks for reaching out! I'm Jordan from Fargo support. I can help with payments, pending transactions, internal transfers from NovaPAY, or your Fargo balance. How can I help?`,
  thanks: (name) =>
    `You're welcome, ${name}! I'm glad I could help. Is there anything else you'd like to know?`,
  help: (name) =>
    `Of course, ${name}. I can help with topics like pending payments, internal NovaPAY transfers, your Fargo balance, and account details. What would you like to know?`,
  general: (name) =>
    `Thanks for your message, ${name}. I'm Jordan, your Fargo support assistant. Feel free to ask about payments, transfers, your balance, or account settings.`,
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
  role: "Support Specialist",
  online: true,
  avatarColor: "#0f766e",
};