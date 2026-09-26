// Simulated support agent — keyword-driven scripted replies.
// This is NOT a real chatbot service. Responses are stored locally in the
// application database and never leave the demo environment.

import { money } from "@/lib/utils";

type Category =
  | "pending"
  | "account"
  | "transaction"
  | "login"
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
  { keywords: /pending|reserved|treating.*transfer|when.*(complete|clear)/i, category: "pending" },
  { keywords: /login|sign\s?in|password|cannot.*(access|enter)|locked|forgot/i, category: "login" },
  { keywords: /balance|how much|funds|insufficient|spent|available/i, category: "balance" },
  { keywords: /security|fraud|scam|2fa|two.?factor|unauthorized/i, category: "security" },
  { keywords: /transaction|payment|refund|history|statement|recent/i, category: "transaction" },
  { keywords: /account|profile|details|change.*(name|phone)|number|routing/i, category: "account" },
  { keywords: /\bhi\b|\bhello\b|\bhey\b|\bgood (morning|afternoon|evening)\b/i, category: "greeting" },
  { keywords: /\bthanks\b|\bthank you\b|\bthx\b/i, category: "thanks" },
  { keywords: /\bhelp\b|\bsupport\b|\bassist\b/i, category: "help" },
];

/** Live account facts the agent can quote instead of guessing. */
export interface SupportContext {
  /** Available balance of the customer's primary account, in dollars. */
  balance?: number | null;
}

const REPLIES: Record<Category, (name: string, ctx: SupportContext) => string> = {
  pending: (name) =>
    `Hello ${name}. Thanks for checking in — a PENDING transaction just means that payment hasn't finished settling yet. ` +
    `Settlement normally completes within one to two business days, and the most common reasons it takes a little longer are: ` +
    `the sending bank is still batching the payment, the recipient's bank is taking extra time to process it, ` +
    `the payment is held for a routine verification or compliance review, or it is waiting in our processing queue during a busy period. ` +
    `The amount stays reserved in your available balance the whole time and is released automatically once the payment completes or is returned. ` +
    `There is nothing you need to send or pay to move it along — the normal processing window just needs to finish. ` +
    `You'll get a notification as soon as the status changes. If it's still pending after three business days, send me the date and amount and I'll look into it further.`,
  account: (name) =>
    `Hi ${name}. Let me pull up the account details for you. Your account is a "Premium Dollar Checking" account in USD. The account number is 7842-XXXX and the routing number is 084000026. Do you need help editing your profile or viewing your account page?`,
  transaction: (name) =>
    `Of course, ${name}. You can review every transaction on the Transactions page using the search and filter tools. Would you like me to explain any specific transaction type?`,
  login: (name) =>
    `Sure, ${name}. Passwords are stored securely as salted hashes, so we never keep a plain-text copy. If you can't sign in, ` +
    `first check that you're using the email address your account was created with. If you need a new account or want your password reset, ` +
    `please contact your NovaPAY representative — for security, accounts are created and access is restored by our team rather than through a public sign-up page.`,
  balance: (name, ctx) => {
    const formatted =
      typeof ctx.balance === "number" && Number.isFinite(ctx.balance)
        ? `$${money(ctx.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : null;
    return formatted
      ? `Hi ${name}. Your current available balance is ${formatted}. It's calculated from the entries in your account ledger, so it updates as deposits, payments and transfers post. You can see the full breakdown over time on the Balance History page.`
      : `Hi ${name}. Your available balance is calculated from the entries in your account ledger, so it updates as deposits, payments and transfers post. You can see the full breakdown over time on the Balance History page.`;
  },
  security: (name) =>
    `Hello ${name}. You can review and update your security controls on the Security page, including your password, two-factor authentication and session management. Would you like help with any of these?`,
  greeting: (name) =>
    `Hello ${name}, thanks for reaching out! I'm Sarah from NovaPAY support. I can help with questions about your account, transfers, or transactions. How can I help?`,
  thanks: (name) =>
    `You're welcome, ${name}! I'm glad I could help. Is there anything else you'd like to know?`,
  help: (name) =>
    `Of course, ${name}. I can help with topics like pending transfers, your balance, transactions, account details, and login issues. What would you like to know?`,
  general: (name) =>
    `Thanks for your message, ${name}. I'm Sarah, your NovaPAY support assistant. Feel free to ask about transfers, transactions, your balance, or account settings.`,
};

export function simulateAgentReply(
  firstName: string,
  message: string,
  ctx: SupportContext = {},
): string {
  let category: Category = "general";
  for (const rule of RULES) {
    if (rule.keywords.test(message)) {
      category = rule.category;
      break;
    }
  }
  return REPLIES[category](firstName, ctx);
}

export const AGENT_PROFILE = {
  displayName: "Sarah — Northstar Support",
  role: "Support Specialist",
  online: true,
  avatarColor: "#0f766e",
};