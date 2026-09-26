import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { BANK_FARGO, BANK_NOVAPAY, DEMO_ACCOUNT, FARGO_ACCOUNT } from "@/lib/constants";
import { money } from "@/lib/utils";
import { generateHistory, OPENING_BALANCE_CENTS } from "@/lib/demo-history";

// Opening balance given to every newly created customer account: $2,350,000.00.
const OPENING_BALANCE = OPENING_BALANCE_CENTS / 100;

export interface NewUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string | null;
}

/**
 * Creates a customer account with exactly the same setup a new customer
 * receives: a NovaPAY checking account funded to $2,350,000.00, a Fargo digital
 * checking account, a matching simulated transaction history running from
 * January 2019 up to today, monthly balance-history snapshots, and the two
 * welcome notifications.
 *
 * This is the single source of truth for account creation. It is called only
 * from admin-authorised code paths — public registration is disabled.
 *
 * Security notes:
 * - The password is hashed with the application's existing scrypt
 *   implementation. The plaintext is never stored or returned.
 * - `isAdmin` and `isActive` are assigned here and are never read from the
 *   caller's input, so no request body can escalate a role.
 * - The opening balance and the entire history are generated here. Nothing about
 *   either is read from the caller's input, so no request can set a balance.
 * - The ledger is built to reconcile to exactly $2,350,000.00: the opening
 *   deposit is derived from the rest of the activity rather than being a fixed
 *   number, and the result is checked against the target before anything is
 *   written.
 */
export async function createUserAccount(input: NewUserInput) {
  const passwordHash = await hashPassword(input.password);
  const phone = input.phone?.trim() ? input.phone.trim() : null;
  const novaAccountNumber = `${Math.floor(1000 + Math.random() * 9000)}-XXXX`;
  const fargoAccountNumber = `${Math.floor(1000 + Math.random() * 9000)}-XXXX`;

  // Seeded from the email so the same customer always gets the same history.
  const history = generateHistory(input.email);

  // Fail loudly rather than persisting a ledger that does not reconcile.
  if (history.finalBalanceCents !== OPENING_BALANCE_CENTS) {
    throw new Error("Generated history does not reconcile to the opening balance");
  }

  return prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      phone,
      // Always a plain, active customer account.
      isAdmin: false,
      isActive: true,
      accounts: {
        create: [
          {
            bank: BANK_NOVAPAY,
            type: DEMO_ACCOUNT.type,
            currency: DEMO_ACCOUNT.currency,
            accountNumber: novaAccountNumber,
            routingNumber: DEMO_ACCOUNT.routingNumber,
            status: DEMO_ACCOUNT.status,
            balance: OPENING_BALANCE,
          },
          {
            bank: BANK_FARGO,
            type: FARGO_ACCOUNT.type,
            currency: FARGO_ACCOUNT.currency,
            accountNumber: fargoAccountNumber,
            routingNumber: FARGO_ACCOUNT.routingNumber,
            status: FARGO_ACCOUNT.status,
            balance: FARGO_ACCOUNT.initialBalance,
          },
        ],
      },
      transactions: {
        create: history.transactions.map((t) => ({
          bank: BANK_NOVAPAY,
          transactionReference: t.transactionReference,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          recipientName: t.recipientName,
          recipientReference: t.recipientReference,
          recipientEmail: t.recipientEmail,
          description: t.description,
          category: t.category,
          status: t.status,
          runningBalance: t.runningBalance,
          createdAt: t.date,
        })),
      },
      balanceHistory: {
        create: history.balanceHistory.map((p) => ({
          bank: BANK_NOVAPAY,
          date: p.date,
          balance: p.balance,
        })),
      },
      notifications: {
        create: [
          {
            bank: BANK_NOVAPAY,
            title: "Welcome to NovaPAY Bank",
            message: `Your account is ready with an opening balance of $${money(OPENING_BALANCE).toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
            type: "system",
          },
          {
            bank: BANK_FARGO,
            title: "Welcome to Fargo",
            message:
              "Your Digital Checking Account is ready with a $0.00 opening balance. Transfer funds in from NovaPAY to get started.",
            type: "system",
          },
        ],
      },
    },
  });
}
