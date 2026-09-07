describe("cors config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("permite origenes explicitos en CORS_ORIGINS", async () => {
    process.env.CORS_ORIGINS = "http://localhost:3000,https://*.mi-dominio.com";
    delete process.env.CORS_ORIGIN_SUFFIXES;

    const { isOriginAllowed } = await import("../cors");

    expect(isOriginAllowed("http://localhost:3000")).toBe(true);
    expect(isOriginAllowed("https://staging.mi-dominio.com")).toBe(true);
  });

  it("rechaza origenes fuera de la politica cuando CORS_ORIGINS esta definido", async () => {
    process.env.CORS_ORIGINS = "https://app.misioneros.local";
    delete process.env.CORS_ORIGIN_SUFFIXES;

    const { isOriginAllowed } = await import("../cors");

    expect(isOriginAllowed("https://app.misioneros.local")).toBe(true);
    expect(isOriginAllowed("https://evil.example.com")).toBe(false);
  });

  it("permite suffix-only sin CORS_ORIGINS explicitos", async () => {
    delete process.env.CORS_ORIGINS;
    process.env.CORS_ORIGIN_SUFFIXES = ".misioneros.local";

    const { isOriginAllowed, buildCorsOptions } = await import("../cors");
    const options = buildCorsOptions();

    expect(isOriginAllowed("https://app.misioneros.local")).toBe(true);

    await new Promise<void>((resolve, reject) => {
      (options.origin as Function)(
        "https://evil.example.com",
        (err: Error | null, allowed?: boolean) => {
          try {
            expect(allowed).toBe(false);
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  });

  it("en development permite origenes de LAN aunque CORS_ORIGINS este definido", async () => {
    process.env.NODE_ENV = "development";
    process.env.CORS_ORIGINS = "http://localhost:3050";
    delete process.env.CORS_ORIGIN_SUFFIXES;

    const { isPrivateLanOrigin, buildCorsOptions } = await import("../cors");
    const options = buildCorsOptions();

    expect(isPrivateLanOrigin("http://192.168.0.120:3050")).toBe(true);
    expect(isPrivateLanOrigin("https://10.0.0.8:3050")).toBe(true);

    await new Promise<void>((resolve, reject) => {
      (options.origin as Function)(
        "http://192.168.0.120:3050",
        (err: Error | null, allowed?: boolean) => {
          try {
            expect(err).toBeNull();
            expect(allowed).toBe(true);
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  });

  it("falla en staging si no hay origenes ni suffixes", async () => {
    process.env.NODE_ENV = "staging";
    delete process.env.CORS_ORIGINS;
    delete process.env.CORS_ORIGIN_SUFFIXES;

    const { assertCorsConfiguredForDeployedEnv } = await import("../cors");

    expect(() => assertCorsConfiguredForDeployedEnv()).toThrow(/CORS_ORIGINS/);
  });
});
