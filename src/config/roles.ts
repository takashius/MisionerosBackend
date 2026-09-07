export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MISIONERO: "MISIONERO",
  PARTICIPANTE: "PARTICIPANTE",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MISIONERO,
  ROLES.PARTICIPANTE,
];

export const ADMIN_ROLES: UserRole[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: "Administrador del sistema",
  ADMIN: "Administrador",
  MISIONERO: "Misionero",
  PARTICIPANTE: "Participante",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && ALL_ROLES.includes(value as UserRole);
}

export function isAdminRole(role: string | string[] | undefined): boolean {
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  return roles.some((item) => ADMIN_ROLES.includes(item as UserRole));
}

export function isSuperAdminRole(role: string | string[] | undefined): boolean {
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  return roles.includes(ROLES.SUPER_ADMIN);
}

/** Roles que un ADMIN puede asignar (no puede crear SUPER_ADMIN). */
export function assignableRolesFor(actorRole: string | string[]): UserRole[] {
  if (isSuperAdminRole(actorRole)) {
    return [...ALL_ROLES];
  }
  if (isAdminRole(actorRole)) {
    return [ROLES.ADMIN, ROLES.MISIONERO, ROLES.PARTICIPANTE];
  }
  return [];
}
