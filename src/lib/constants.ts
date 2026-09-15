// Fictional bank identity — clearly not a real financial institution.

export const BANK_NAME = "NovaPAY Bank";
export const BANK_TAGLINE = "Digital banking for a simulated account";

// Banking-environment discriminator used across the schema to keep the two
// simulated ledgers isolated inside the application database.
export const BANK_NOVAPAY = "NOVAPAY";
export const BANK_FARGO = "FARGO";

// Second fictional banking environment inside the same demo database.
export const FARGO_BANK_NAME = "Fargo";
export const FARGO_BANK_TAGLINE = "Digital banking, reimagined for a demo";
export const FARGO_ACCOUNT = {
  type: "Simulated Digital Checking Account",
  shortType: "Simulated Digital Checking",
  currency: "USD",
  accountNumber: "FARG-9231-XXXX",
  routingNumber: "DEMO-ROUTING-F",
  status: "Active — Demo",
  initialBalance: 0,
};

export const DEMO_USER = {
  firstName: "Michael",
  lastName: "Anderson",
  email: "michael.anderson@example.com",
  password: "DemoPass123!",
  phone: "+1 (555) 010-2030",
};

export const DEMO_ACCOUNT = {
  type: "Premium Dollar Checking Account",
  shortType: "Premium Dollar Checking",
  currency: "USD",
  accountNumber: "DEMO-7842-XXXX",
  routingNumber: "DEMO-ROUTING",
  status: "Active — Demo",
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

export const SIMULATION_NOTICE =
  "NovaPAY — Simulated Account";

export const FARGO_SIMULATION_NOTICE =
  "Fargo — Simulated Account";

export const SIMULATION_COPY =
  "This is a fictional banking demonstration. No real money is sent or received.";