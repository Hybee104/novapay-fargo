// Fictional bank identity — clearly not a real financial institution.
// Nothing in this project represents a real bank, and no value here may be
// presented as a real account, balance, or financial product.

export const BANK_NAME = "NovaPAY Bank";
export const BANK_TAGLINE = "Digital banking — secure and effortless";

/**
 * Canonical demo/simulation disclosure.
 *
 * This string is rendered on the homepage, the login page, the authenticated
 * NovaPAY and Fargo dashboards, and the account pages. Keep it in one place so
 * the wording stays consistent everywhere the app is presented.
 */
export const DEMO_DISCLOSURE_SHORT =
  "Demo project — not a real bank. No real money, accounts, or financial services exist here.";

export const DEMO_DISCLOSURE_LONG =
  "DEMO PROJECT — NovaPAY is a fictional banking application created for educational and software demonstration purposes. It is not a real bank and does not hold real money or financial accounts.";

/** Shown wherever generated ledger/history data is displayed. */
export const SIMULATED_DATA_DISCLOSURE =
  "Simulated demo data — generated for demonstration only. No real transactions, balances, or counterparties are represented.";

// Banking-environment discriminator used across the schema to keep the two
// simulated ledgers isolated inside the application database.
export const BANK_NOVAPAY = "NOVAPAY";
export const BANK_FARGO = "FARGO";

// Second fictional banking environment inside the same demo database.
export const FARGO_BANK_NAME = "Fargo";
export const FARGO_BANK_TAGLINE = "Digital banking, reimagined for you";
export const FARGO_ACCOUNT = {
  type: "Digital Checking Account",
  shortType: "Digital Checking",
  currency: "USD",
  accountNumber: "9231-XXXX",
  routingNumber: "084000036",
  status: "Active",
  initialBalance: 0,
};

// Identity of the seeded demonstration user.
//
// SECURITY: this object deliberately contains NO password. The demo password is
// never stored in source control and is never rendered into any page. It is
// supplied to the seed script through the DEMO_USER_PASSWORD environment
// variable (see .env.example), and existing deployments must rotate the seeded
// credential out of band.
export const DEMO_USER = {
  firstName: "Michael",
  lastName: "Anderson",
  email: "michael.anderson@example.com",
  phone: "+1 (555) 010-2030",
};

export const DEMO_ACCOUNT = {
  type: "Premium Dollar Checking Account",
  shortType: "Premium Dollar Checking",
  currency: "USD",
  accountNumber: "7842-XXXX",
  routingNumber: "084000026",
  status: "Active",
  initialBalance: 650000,
};

export const SUPPORT_AGENT = {
  name: "Sarah",
  displayName: "Sarah — Northstar Support",
  online: true,
};

export const FARGO_SUPPORT_AGENT = {
  name: "Jordan",
  displayName: "Jordan — Fargo Support",
  online: true,
};