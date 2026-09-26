import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { BANK_FARGO, BANK_NOVAPAY, DEMO_ACCOUNT, FARGO_ACCOUNT } from "@/lib/constants";
import { money } from "@/lib/utils";

// Opening credit given to every newly created customer account.
const WELCOME_CREDIT = 50000;

export interface NewUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string | null;
}

/**
 * Creates a customer account with exactly the same setup a new customer
 * receives: a NovaPAY checking account with the opening welcome credit, a
 * Fargo digital checking account, the matching opening-balance transaction,
 * a balance-history snapshot and the two welcome notifications.
 *
 * This is the single source of truth for account creation. It is called only
 * from admin-authorised code paths — public registration is disabled.
 *
 * Security notes:
 * - The password is hashed with the application's existing scrypt
 *   implementation. The plaintext is never stored or returned.
 * - `isAdmin` and `isActive` are assigned here and are never read from the
 *   caller's input, so no request body can escalate a role.
 */
export async function createUserAccount(input: NewUserInput) {
  const passwordHash = await hashPassword(input.password);
  const phone = input.phone?.trim() ? input.phone.trim() : null;
  const novaAccountNumber = `${Math.floor(1000 + Math.random() * 9000)}-XXXX`;
  const fargoAccountNumber = `${Math.floor(1000 + Math.random() * 9000)}-XXXX`;

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
            balance: WELCOME_CREDIT,
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
        create: {
          bank: BANK_NOVAPAY,
          transactionReference: `SIM-TXN-${new Date().getFullYear()}-WELCOME-${crypto.randomUUID()}`,
          type: "Deposit",
          amount: WELCOME_CREDIT,
          currency: "USD",
          recipientName: "NovaPAY Bank",
          recipientReference: novaAccountNumber,
          description: "Opening welcome credit",
          category: "Welcome",
          status: "COMPLETED",
        },
      },
      balanceHistory: {
        create: {
          bank: BANK_NOVAPAY,
          date: new Date(),
          balance: WELCOME_CREDIT,
        },
      },
      notifications: {
        create: [
          {
            bank: BANK_NOVAPAY,
            title: "Welcome to NovaPAY Bank",
            message: `Your account is ready with an opening balance of $${money(WELCOME_CREDIT).toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
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
