import {
  ALL_ROLES,
  ROLES,
  STAFF_ROLES,
  assignableRolesFor,
  isAdminRole,
  isStaffRole,
  isUserRole,
} from "../roles";

describe("roles", () => {
  it("incluye los roles de staff del evento", () => {
    expect(ALL_ROLES).toEqual([
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.LOGISTICA,
      ROLES.MISIONERO,
      ROLES.PARTICIPANTE,
    ]);
    expect(STAFF_ROLES).toEqual([
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.LOGISTICA,
    ]);
  });

  it("isUserRole valida strings", () => {
    expect(isUserRole("ADMIN")).toBe(true);
    expect(isUserRole("COORDINADOR")).toBe(true);
    expect(isUserRole("LOGISTICA")).toBe(true);
    expect(isUserRole("PROV_ADMIN")).toBe(false);
  });

  it("isAdminRole cubre SUPER_ADMIN y ADMIN", () => {
    expect(isAdminRole(["SUPER_ADMIN"])).toBe(true);
    expect(isAdminRole(["ADMIN"])).toBe(true);
    expect(isAdminRole(["COORDINADOR"])).toBe(false);
    expect(isAdminRole(["MISIONERO"])).toBe(false);
  });

  it("isStaffRole cubre operadores del evento", () => {
    expect(isStaffRole(["COORDINADOR"])).toBe(true);
    expect(isStaffRole(["LOGISTICA"])).toBe(true);
    expect(isStaffRole(["PARTICIPANTE"])).toBe(false);
  });

  it("ADMIN no puede asignar SUPER_ADMIN", () => {
    expect(assignableRolesFor(["ADMIN"])).not.toContain(ROLES.SUPER_ADMIN);
    expect(assignableRolesFor(["ADMIN"])).toEqual(
      expect.arrayContaining([
        ROLES.ADMIN,
        ROLES.COORDINADOR,
        ROLES.LOGISTICA,
        ROLES.PARTICIPANTE,
      ])
    );
    expect(assignableRolesFor(["SUPER_ADMIN"])).toContain(ROLES.SUPER_ADMIN);
  });
});
