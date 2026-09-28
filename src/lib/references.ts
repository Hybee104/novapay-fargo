// Generates transaction and support references (NVP-TXN-YYYY-XXXXXX, NVP-TKT-XXXXX).
// The trailing code is drawn from a 32-character alphabet with visually ambiguous
// characters (0/1/I/O) removed, so references are unambiguous when read aloud.

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomRefCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return out;
}

export function generateTransactionReference(): string {
  const year = new Date().getFullYear();
  return `NVP-TXN-${year}-${randomRefCode()}`;
}

export function generateSupportReference(): string {
  return `NVP-TKT-${randomRefCode(5)}`;
}

// ---- Fargo reference namespace ----

export function generateFargoPaymentReference(): string {
  const year = new Date().getFullYear();
  return `FARG-PAY-${year}-${randomRefCode()}`;
}

export function generateFargoTransferReference(): string {
  const year = new Date().getFullYear();
  return `FARG-XFER-${year}-${randomRefCode()}`;
}

export function generateFargoSupportReference(): string {
  return `FARG-TKT-${randomRefCode(5)}`;
}