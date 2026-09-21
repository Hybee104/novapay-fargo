// Simulated support agent — keyword-driven scripted replies.
// This is NOT a real chatbot service. Responses are stored locally in the
// application database and never leave the demo environment.

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

const REPLIES: Record<Category, (name: string) => string> = {
  pending: (name) =>
    `Hello ${name}. The transfer you see is currently marked as PENDING. That means the amount is reserved within your available balance but has not yet settled. You'll receive a notification once it completes.`,
  account: (name) =>
    `Hi ${name}. Let me pull up the account details for you. Your account is a "Premium Dollar Checking" account in USD. The account number is 7842-XXXX and the routing number is 084000026. Do you need help editing your profile or viewing your account page?`,
  transaction: (name) =>
    `Of course, ${name}. You can review every transaction on the Transactions page using the search and filter tools. Would you like me to explain any specific transaction type?`,
  login: (name) =>
    `Sure, ${name}. Credentials are stored securely with hashed passwords. If you're having trouble signing in, you can register a new account or use the example sign-in (michael.anderson@example.com).`,
  balance: (name) =>
    `Hi ${name}. Your available balance is computed from the ledger in your account. The starting balance is $650,000.00 and it changes whenever you create transfers. Is there anything else you'd like to know?`,
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

export function simulateAgentReply(firstName: string, message: string): string {
  let category: Category = "general";
  for (const rule of RULES) {
    if (rule.keywords.test(message)) {
      category = rule.category;
      break;
    }
  }
  return REPLIES[category](firstName);
}

export const AGENT_PROFILE = {
  displayName: "Sarah — Northstar Support",
  role: "Support Specialist",
  online: true,
  avatarColor: "#0f766e",
};