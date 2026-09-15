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
    `Hello ${name}. The transfer you see is currently marked as PENDING. That means the amount is reserved within your available balance but has not been settled. This account runs on a simulated balance — no real funds are moved or received.`,
  account: (name) =>
    `Hi ${name}. Let me pull up the account details for you. Your account is a "Premium Dollar Checking" account in USD. The account number (DEMO-7842-XXXX) and routing number (DEMO-ROUTING) are fictional placeholders, not tied to any real institution. Do you need help editing your profile or viewing your account page?`,
  transaction: (name) =>
    `Of course, ${name}. You can review every transaction on the Transactions page using the search and filter tools. All entries are part of the NovaPAY simulation and don't represent real banking records. Would you like me to explain any specific transaction type?`,
  login: (name) =>
    `Sure, ${name}. Credentials are stored only inside the application database with hashed passwords. If you're having trouble signing in, you can register a new account or use the seeded demo user (michael.anderson@example.com).`,
  balance: (name) =>
    `Hi ${name}. Your available balance is computed from the ledger inside this application. The initial balance is $650,000.00 and it only changes when you create transfers. As a simulation, no real money is involved.`,
  security: (name) =>
    `Hello ${name}. The security controls on this page (password change, two-factor toggle, session management) are part of the simulated environment — no external authentication service or bank is involved. Would you like to review the security settings?`,
  greeting: (name) =>
    `Hello ${name}, thanks for reaching out! I'm Sarah from NovaPAY support. I can help with questions about your account, transfers, or transactions. How can I help?`,
  thanks: (name) =>
    `You're welcome, ${name}! I'm glad I could help. Is there anything else you'd like to know?`,
  help: (name) =>
    `Of course, ${name}. I can help with topics like pending transfers, your balance, transactions, account details, and login issues. What would you like to know?`,
  general: (name) =>
    `Thanks for your message, ${name}. I'm a simulated support assistant for the NovaPAY Bank demonstration — no real banking systems are involved. Feel free to ask about transfers, transactions, your balance, or account settings.`,
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
  role: "Simulated Support Agent",
  online: true,
  avatarColor: "#0f766e",
};