import * as validator from "email-validator";

/** Normaliza email para queries; rechaza objetos/operadores MongoDB. */
export function sanitizeEmailInput(email: unknown): string | null {
  if (typeof email !== "string") {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized || !validator.validate(normalized)) {
    return null;
  }
  return normalized;
}
