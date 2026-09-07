import {
  mapAuthCatchError,
  mapJwtVerifyError,
} from "../authErrors";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

describe("authErrors", () => {
  it("mapea TokenExpiredError a TOKEN_EXPIRED", () => {
    const mapped = mapJwtVerifyError(
      new TokenExpiredError("jwt expired", new Date())
    );
    expect(mapped.code).toBe("TOKEN_EXPIRED");
  });

  it("mapea JsonWebTokenError a TOKEN_INVALID", () => {
    const mapped = mapJwtVerifyError(new JsonWebTokenError("invalid token"));
    expect(mapped.code).toBe("TOKEN_INVALID");
  });

  it("mapea permisos insuficientes a 403", () => {
    const mapped = mapAuthCatchError(new Error("Insufficient permissions"));
    expect(mapped.status).toBe(403);
    expect(mapped.code).toBe("INSUFFICIENT_PERMISSIONS");
  });

  it("mapea token ausente a 401 TOKEN_MISSING", () => {
    const mapped = mapAuthCatchError(new Error("Token not provided"));
    expect(mapped.status).toBe(401);
    expect(mapped.code).toBe("TOKEN_MISSING");
  });
});
