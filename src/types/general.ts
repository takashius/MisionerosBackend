import mongoose from "mongoose";
import { Request } from "express";
import type { UserRole } from "../config/roles";

type ObjectId = mongoose.Types.ObjectId;

export type MongoId = string | ObjectId;
export type DateType = Date | string;

export interface StoreResponse {
  status: number;
  message: any;
  detail?: any;
}

/** Usuario inyectado por el middleware `auth` en `req.user`. */
export interface AuthenticatedRequestUser {
  _id: ObjectId | string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole[];
  photo?: string;
  active?: boolean;
}

/** Request autenticado; alinea con la ampliación global en `src/types.d.ts`. */
export interface IGetUserAuthInfoRequest extends Request {
  user?: AuthenticatedRequestUser;
  token?: string;
}

/** Request con `user` garantizado tras validación de autenticación. */
export type AuthenticatedRequest = IGetUserAuthInfoRequest & {
  user: AuthenticatedRequestUser;
};

export type { Request, Response } from "express";
