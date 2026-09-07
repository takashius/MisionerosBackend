import { sanitizeEmailInput } from "../sanitizeEmail";

describe("sanitizeEmailInput", () => {
  it("normaliza email válido", () => {
    expect(sanitizeEmailInput("  User@Example.COM ")).toBe("user@example.com");
  });

  it("rechaza objetos MongoDB", () => {
    expect(sanitizeEmailInput({ $gt: "" })).toBeNull();
  });

  it("rechaza email inválido", () => {
    expect(sanitizeEmailInput("not-an-email")).toBeNull();
  });
});
