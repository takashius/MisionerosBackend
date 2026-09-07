import { JwtPayload, verify } from "jsonwebtoken";
import { User } from "../components/user/model";
import config from "../config/commons";
import { NextFunction } from "express";
import {
  ALL_ROLES,
  ROLES,
  UserRole,
  isSuperAdminRole,
} from "../config/roles";
import {
  mapAuthCatchError,
  mapJwtVerifyError,
  sendAuthError,
} from "../utils/authErrors";

function toRoleArray(role: string | string[] | undefined): UserRole[] {
  if (Array.isArray(role)) {
    return role.filter((item): item is UserRole =>
      ALL_ROLES.includes(item as UserRole)
    );
  }
  if (role && ALL_ROLES.includes(role as UserRole)) {
    return [role as UserRole];
  }
  return [];
}

/**
 * Autenticación JWT. Si se pasan roles, el usuario debe tener uno de ellos.
 * SUPER_ADMIN siempre pasa el filtro de roles.
 */
export default function auth(allowedRoles: UserRole[] = []) {
  return async (req: any, res: any, next: NextFunction) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        sendAuthError(
          res,
          401,
          "TOKEN_MISSING",
          "Token de autenticación requerido"
        );
        return;
      }

      let data: JwtPayload;
      try {
        data = verify(token, config.JWT_KEY) as JwtPayload;
      } catch (jwtError) {
        const mapped = mapJwtVerifyError(jwtError);
        sendAuthError(res, 401, mapped.code, mapped.error);
        return;
      }

      const user = await User.findOne({
        _id: data._id,
        "tokens.token": token,
        $or: [{ active: true }, { active: { $exists: false } }],
      });

      if (!user) {
        sendAuthError(
          res,
          401,
          "SESSION_REVOKED",
          "Sesión no válida o revocada"
        );
        return;
      }

      const role = toRoleArray(user.role);
      req.user = {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role,
        photo: user.photo,
        active: user.active,
      };
      req.token = token;
      req.userIp = req.ip || req.headers["x-forwarded-for"] || "unknown";

      if (allowedRoles.length > 0) {
        const allowed = isSuperAdminRole(role)
          ? true
          : role.some((item) => allowedRoles.includes(item));
        if (!allowed) {
          sendAuthError(
            res,
            403,
            "INSUFFICIENT_PERMISSIONS",
            "No tienes permiso para esta acción"
          );
          return;
        }
      }

      next();
    } catch (error) {
      console.log("AUTH ERROR", error);
      const mapped = mapAuthCatchError(error);
      sendAuthError(res, mapped.status, mapped.code, mapped.error);
    }
  };
}

/** Middleware que solo permite SUPER_ADMIN. */
export function authSuperAdminOnly() {
  return auth([ROLES.SUPER_ADMIN]);
}

/** Middleware que permite SUPER_ADMIN o ADMIN. */
export function authAdminOnly() {
  return auth([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
}
