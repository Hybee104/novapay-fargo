// Generates clearly-simulated transaction references (SIM-TXN-YYYY-XXXXXX).

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomSimCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return out;
}

export function generateTransactionReference(): string {
  const year = new Date().getFullYear();
  return `SIM-TXN-${year}-${randomSimCode()}`;
}

export function generateSupportReference(): string {
  return `SIM-TKT-${randomSimCode(5)}`;
}

// ---- Fargo (second simulated banking environment) references ----

export function generateFargoPaymentReference(): string {
  const year = new Date().getFullYear();
  return `FARG-PAY-${year}-${randomSimCode()}`;
}

export function generateFargoTransferReference(): string {
  const year = new Date().getFullYear();
  return `FARG-XFER-${year}-${randomSimCode()}`;
}

export function generateFargoSupportReference(): string {
  return `FARG-TKT-${randomSimCode(5)}`;
}