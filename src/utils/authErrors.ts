import type { Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export type AuthErrorCode =
  | "TOKEN_MISSING"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "SESSION_REVOKED"
  | "USER_NOT_FOUND"
  | "INSUFFICIENT_PERMISSIONS"
  | "SUPER_ADMIN_ONLY";

export function sendAuthError(
  res: Response,
  status: 401 | 403,
  code: AuthErrorCode,
  error: string,
  extra?: Record<string, unknown>
): void {
  res.status(status).send({ error, code, ...extra });
}

export function mapJwtVerifyError(error: unknown): {
  code: AuthErrorCode;
  error: string;
} {
  if (error instanceof TokenExpiredError) {
    return {
      code: "TOKEN_EXPIRED",
      error: "Sesión expirada o no válida",
    };
  }
  if (error instanceof JsonWebTokenError) {
    return {
      code: "TOKEN_INVALID",
      error: "Token de sesión no válido",
    };
  }
  return {
    code: "TOKEN_INVALID",
    error: "Token de sesión no válido",
  };
}

export function mapAuthCatchError(error: unknown): {
  status: 401 | 403;
  code: AuthErrorCode;
  error: string;
} {
  if (error instanceof Error) {
    if (error.message === "Token not provided") {
      return {
        status: 401,
        code: "TOKEN_MISSING",
        error: "Token de autenticación requerido",
      };
    }
    if (error.message === "User not found") {
      return {
        status: 401,
        code: "SESSION_REVOKED",
        error: "Sesión no válida o revocada",
      };
    }
    if (error.message === "Insufficient permissions") {
      return {
        status: 403,
        code: "INSUFFICIENT_PERMISSIONS",
        error: "No tienes permiso para esta acción",
      };
    }
  }
  return {
    status: 401,
    code: "TOKEN_INVALID",
    error: "No autorizado",
  };
}
