import { round2 } from "@/lib/utils";

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email.trim());
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

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegister(body: unknown): ValidationResult<RegisterInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const firstName = cleanString(b.firstName);
  const lastName = cleanString(b.lastName);
  const email = cleanString(b.email);
  const password = cleanString(b.password);
  const confirmPassword = cleanString(b.confirmPassword);
  const errors: Record<string, string> = {};

  if (!firstName) errors.firstName = "First name is required.";
  else if (firstName.length > 60) errors.firstName = "First name must be 60 characters or fewer.";

  if (!lastName) errors.lastName = "Last name is required.";
  else if (lastName.length > 60) errors.lastName = "Last name must be 60 characters or fewer.";

  if (!email) errors.email = "Email is required.";
  else if (!validateEmail(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Password must include uppercase, lowercase and a number.";
  }

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { firstName, lastName, email: email.toLowerCase(), password, confirmPassword },
    errors: {},
  };
}

export interface LoginInput {
  email: string;
  password: string;
  remember: boolean;
}

export function validateLogin(body: unknown): ValidationResult<LoginInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const email = cleanString(b.email);
  const password = cleanString(b.password);
  const errors: Record<string, string> = {};

  if (!email) errors.email = "Email is required.";
  else if (!validateEmail(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { email: email.toLowerCase(), password, remember: Boolean(b.remember) },
    errors: {},
  };
}

export interface TransferInput {
  recipientName: string;
  recipientEmail: string;
  recipientReference: string;
  amount: number;
  currency: string;
  purpose: string;
  description: string;
}

const PURPOSE_OPTIONS = ["General transfer", "Rent", "Salary", "Invoice / Business", "Personal gift", "Tuition", "Other"];

export function validateTransfer(body: unknown): ValidationResult<TransferInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const recipientName = cleanString(b.recipientName);
  const recipientEmail = cleanString(b.recipientEmail);
  const recipientReference = cleanString(b.recipientReference);
  const currency = cleanString(b.currency).toUpperCase() || "USD";
  const purpose = cleanString(b.purpose);
  const description = cleanString(b.description);
  const amount = parseAmount(b.amount);
  const errors: Record<string, string> = {};

  if (!recipientName) errors.recipientName = "Please enter a valid recipient.";
  else if (recipientName.length > 120) errors.recipientName = "Recipient name is too long.";

  if (!recipientEmail) errors.recipientEmail = "Recipient email is required.";
  else if (!validateEmail(recipientEmail)) errors.recipientEmail = "Enter a valid recipient email.";

  if (!recipientReference) errors.recipientReference = "Recipient account / reference is required.";

  if (amount === null) errors.amount = "Enter a valid USD amount.";
  else if (amount <= 0) errors.amount = "Amount must be greater than zero.";
  else if (amount > 10000000) errors.amount = "Amount exceeds the simulated transfer limit ($10,000,000.00).";

  if (currency !== "USD") errors.currency = "Only USD is supported in this simulation.";

  if (purpose && !PURPOSE_OPTIONS.includes(purpose)) errors.purpose = "Select a valid transfer purpose.";

  if (description.length > 240) errors.description = "Description must be 240 characters or fewer.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      recipientName,
      recipientEmail,
      recipientReference,
      amount: amount as number,
      currency,
      purpose: purpose || "General transfer",
      description,
    },
    errors: {},
  };
}

export interface TicketInput {
  subject: string;
  category: string;
  description: string;
  priority: string;
}

const TICKET_CATEGORIES = ["Account", "Transaction", "Transfer", "Login & Security", "Card", "Other"];
const TICKET_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export function validateTicket(body: unknown): ValidationResult<TicketInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const subject = cleanString(b.subject);
  const category = cleanString(b.category);
  const description = cleanString(b.description);
  const priority = cleanString(b.priority);
  const errors: Record<string, string> = {};

  if (!subject) errors.subject = "Subject is required.";
  else if (subject.length > 120) errors.subject = "Subject must be 120 characters or fewer.";

  if (!category) errors.category = "Category is required.";
  else if (!TICKET_CATEGORIES.includes(category)) errors.category = "Select a valid category.";

  if (!description) errors.description = "Description is required.";
  else if (description.length < 10) errors.description = "Description must be at least 10 characters.";
  else if (description.length > 1000) errors.description = "Description must be 1000 characters or fewer.";

  if (!priority) errors.priority = "Priority is required.";
  else if (!TICKET_PRIORITIES.includes(priority)) errors.priority = "Select a valid priority.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { subject, category, description, priority },
    errors: {},
  };
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function validatePasswordChange(body: unknown): ValidationResult<PasswordChangeInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const currentPassword = cleanString(b.currentPassword);
  const newPassword = cleanString(b.newPassword);
  const confirmPassword = cleanString(b.confirmPassword);
  const errors: Record<string, string> = {};

  if (!currentPassword) errors.currentPassword = "Current password is required.";

  if (!newPassword) errors.newPassword = "New password is required.";
  else if (newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters.";
  else if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    errors.newPassword = "Password must include uppercase, lowercase and a number.";
  }

  if (!confirmPassword) errors.confirmPassword = "Please confirm your new password.";
  else if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { currentPassword, newPassword, confirmPassword },
    errors: {},
  };
}

export interface ProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
}

export function validateProfile(body: unknown): ValidationResult<ProfileInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const firstName = cleanString(b.firstName);
  const lastName = cleanString(b.lastName);
  const phone = cleanString(b.phone);
  const errors: Record<string, string> = {};

  if (!firstName) errors.firstName = "First name is required.";
  else if (firstName.length > 60) errors.firstName = "First name must be 60 characters or fewer.";

  if (!lastName) errors.lastName = "Last name is required.";
  else if (lastName.length > 60) errors.lastName = "Last name must be 60 characters or fewer.";

  if (phone && !/^[+\d][\d\s()\-.]{6,24}$/.test(phone)) errors.phone = "Enter a valid phone number.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, value: { firstName, lastName, phone }, errors: {} };
}