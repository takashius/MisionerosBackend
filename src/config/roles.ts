export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  COORDINADOR: "COORDINADOR",
  LOGISTICA: "LOGISTICA",
  MISIONERO: "MISIONERO",
  PARTICIPANTE: "PARTICIPANTE",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.COORDINADOR,
  ROLES.LOGISTICA,
  ROLES.MISIONERO,
  ROLES.PARTICIPANTE,
];

export const ADMIN_ROLES: UserRole[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const STAFF_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.COORDINADOR,
  ROLES.LOGISTICA,
];

export const PAYMENT_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.COORDINADOR,
];

export const SCAN_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.LOGISTICA,
];

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: "Administrador del sistema",
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador",
  LOGISTICA: "Logística",
  MISIONERO: "Misionero",
  PARTICIPANTE: "Participante",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && ALL_ROLES.includes(value as UserRole);
}

function toRoles(role: string | string[] | undefined): string[] {
  return Array.isArray(role) ? role : role ? [role] : [];
}

export function isAdminRole(role: string | string[] | undefined): boolean {
  return toRoles(role).some((item) => ADMIN_ROLES.includes(item as UserRole));
}

export function isStaffRole(role: string | string[] | undefined): boolean {
  return toRoles(role).some((item) => STAFF_ROLES.includes(item as UserRole));
}

export function isPaymentRole(role: string | string[] | undefined): boolean {
  return toRoles(role).some((item) => PAYMENT_ROLES.includes(item as UserRole));
}

export function isScanRole(role: string | string[] | undefined): boolean {
  return toRoles(role).some((item) => SCAN_ROLES.includes(item as UserRole));
}

export function isSuperAdminRole(role: string | string[] | undefined): boolean {
  return toRoles(role).includes(ROLES.SUPER_ADMIN);
}

/** Roles que un ADMIN puede asignar (no puede crear SUPER_ADMIN). */
export function assignableRolesFor(actorRole: string | string[]): UserRole[] {
  if (isSuperAdminRole(actorRole)) {
    return [...ALL_ROLES];
  }
  if (isAdminRole(actorRole)) {
    return [
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.LOGISTICA,
      ROLES.MISIONERO,
      ROLES.PARTICIPANTE,
    ];
  }
  return [];
}
