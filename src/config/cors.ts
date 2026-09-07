import type { CorsOptions } from "cors";

const DEFAULT_ALLOWED_ORIGIN_SUFFIXES: string[] = [];

function parseCsvEnv(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOrigin(origin: string): URL | null {
  try {
    return new URL(origin);
  } catch {
    return null;
  }
}

function matchesWildcardPattern(origin: string, pattern: string): boolean {
  if (!pattern.includes("*")) {
    return origin === pattern;
  }

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");

  return new RegExp(`^${escaped}$`, "i").test(origin);
}

export function getConfiguredOriginSuffixes(): string[] {
  const fromEnv = parseCsvEnv(process.env.CORS_ORIGIN_SUFFIXES);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED_ORIGIN_SUFFIXES;
}

export function getConfiguredOrigins(): string[] {
  return parseCsvEnv(process.env.CORS_ORIGINS);
}

export function isPrivateLanOrigin(origin: string): boolean {
  const parsedOrigin = parseOrigin(origin);
  if (!parsedOrigin) {
    return false;
  }

  const hostname = parsedOrigin.hostname.toLowerCase();
  return (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

export function isOriginAllowed(origin: string): boolean {
  const explicitOrigins = getConfiguredOrigins();
  if (explicitOrigins.some((allowed) => matchesWildcardPattern(origin, allowed))) {
    return true;
  }

  const parsedOrigin = parseOrigin(origin);
  if (!parsedOrigin) {
    return false;
  }

  const hostname = parsedOrigin.hostname.toLowerCase();
  const suffixes = getConfiguredOriginSuffixes();

  return suffixes.some((suffix) => {
    const normalizedSuffix = suffix.toLowerCase();
    return (
      hostname === normalizedSuffix.replace(/^\./, "") ||
      hostname.endsWith(normalizedSuffix)
    );
  });
}

export function assertCorsConfiguredForDeployedEnv(): void {
  const nodeEnv = process.env.NODE_ENV || "development";
  if (nodeEnv !== "production" && nodeEnv !== "staging") {
    return;
  }
  const origins = parseCsvEnv(process.env.CORS_ORIGINS);
  const suffixes = parseCsvEnv(process.env.CORS_ORIGIN_SUFFIXES);
  if (origins.length === 0 && suffixes.length === 0) {
    throw new Error(
      "[cors] Configure CORS_ORIGINS y/o CORS_ORIGIN_SUFFIXES en staging/producción"
    );
  }
}

export function buildCorsOptions(): CorsOptions {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isPermissiveDev = nodeEnv === "development" || nodeEnv === "test";
  const hasExplicitConfig =
    getConfiguredOrigins().length > 0 ||
    getConfiguredOriginSuffixes().length > 0;

  return {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (isPermissiveDev && (!hasExplicitConfig || isPrivateLanOrigin(origin))) {
        return callback(null, true);
      }

      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Origin rechazado: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key",
      "x-requested-with",
    ],
  };
}
