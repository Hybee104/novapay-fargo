import { round2 } from "@/lib/utils";

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors: Record<string, string>;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return round2(value);
  if (typeof value === "string" && value.trim() !== "") {
    const num = Number(value.trim().replace(/,/g, ""));
    if (Number.isFinite(num)) return round2(num);
  }
  return null;
}

export const FARGO_PAYMENT_CATEGORIES = [
  "Utilities",
  "Rent",
  "Groceries",
  "Transport",
  "Subscriptions",
  "Shopping",
  "Dining",
  "Health",
  "Education",
  "Donations",
  "Entertainment",
  "Other",
];

export interface FargoPaymentInput {
  recipientName: string;
  description: string;
  amount: number;
  category: string;
}

export function validateFargoPayment(body: unknown): ValidationResult<FargoPaymentInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const recipientName = cleanString(b.recipientName);
  const description = cleanString(b.description);
  const category = cleanString(b.category);
  const amount = parseAmount(b.amount);
  const errors: Record<string, string> = {};

  if (!recipientName) errors.recipientName = "Recipient is required.";
  else if (recipientName.length > 120) errors.recipientName = "Recipient name is too long.";

  if (!description) errors.description = "Description is required.";
  else if (description.length > 240) errors.description = "Description must be 240 characters or fewer.";

  if (amount === null) errors.amount = "Enter a valid USD amount.";
  else if (amount <= 0) errors.amount = "Amount must be greater than zero.";
  else if (amount > 10000000) errors.amount = "Amount exceeds the simulated payment limit ($10,000,000.00).";

  if (!category) errors.category = "Category is required.";
  else if (!FARGO_PAYMENT_CATEGORIES.includes(category)) errors.category = "Select a valid category.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { recipientName, description, amount: amount as number, category },
    errors: {},
  };
}

export interface FargoTransferInput {
  amount: number;
  description?: string;
}

export function validateFargoTransfer(body: unknown): ValidationResult<FargoTransferInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const amount = parseAmount(b.amount);
  const description = cleanString(b.description);
  const errors: Record<string, string> = {};

  if (amount === null) errors.amount = "Enter a valid USD amount.";
  else if (amount <= 0) errors.amount = "Amount must be greater than zero.";
  else if (amount > 10000000) errors.amount = "Amount exceeds the simulated transfer limit ($10,000,000.00).";

  if (description.length > 240) errors.description = "Description must be 240 characters or fewer.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, value: { amount: amount as number, description }, errors: {} };
}