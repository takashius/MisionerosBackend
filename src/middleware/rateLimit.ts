import rateLimit from "express-rate-limit";

const skipInTest = () => process.env.NODE_ENV === "test";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Demasiados intentos. Intenta más tarde.",
    code: "RATE_LIMITED",
  },
});

export const recoveryRequestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Demasiados intentos. Intenta más tarde.",
    code: "RATE_LIMITED",
  },
});

export const recoverySubmitRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Demasiados intentos. Intenta más tarde.",
    code: "RATE_LIMITED",
  },
});
