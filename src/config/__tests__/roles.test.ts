import {
  ALL_ROLES,
  ROLES,
  assignableRolesFor,
  isAdminRole,
  isUserRole,
} from "../roles";

describe("roles", () => {
  it("reconoce los 4 roles del sistema", () => {
    expect(ALL_ROLES).toEqual([
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.MISIONERO,
      ROLES.PARTICIPANTE,
    ]);
  });

  it("isUserRole valida strings", () => {
    expect(isUserRole("ADMIN")).toBe(true);
    expect(isUserRole("PROV_ADMIN")).toBe(false);
  });

  it("isAdminRole cubre SUPER_ADMIN y ADMIN", () => {
    expect(isAdminRole(["SUPER_ADMIN"])).toBe(true);
    expect(isAdminRole(["ADMIN"])).toBe(true);
    expect(isAdminRole(["MISIONERO"])).toBe(false);
  });

  it("ADMIN no puede asignar SUPER_ADMIN", () => {
    expect(assignableRolesFor(["ADMIN"])).not.toContain(ROLES.SUPER_ADMIN);
    expect(assignableRolesFor(["SUPER_ADMIN"])).toContain(ROLES.SUPER_ADMIN);
  });
});
