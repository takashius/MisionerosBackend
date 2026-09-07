import mongoose, { Document, Model } from "mongoose";
import type { UserRole } from "../config/roles";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  lastName: string;
  phone: string;
  photo: string;
  banner: string;
  date: Date;
  email: string;
  role: UserRole;
  bio: string;
  address: string;
  password: string;
  recovery: Array<{ code: string; expiresAt?: Date; attempts?: number }>;
  tokens: Array<{ token: string; date: Date }>;
  active: boolean;
  /** false = debe completar contraseña vía PATCH /user/profile. */
  hasLoggedInBefore?: boolean;
  generateAuthToken: () => Promise<string>;
}

export interface IUserModel extends Model<IUser> {
  findByCredentials: (email: string, password: string) => Promise<IUser>;
}

export interface UserResponse {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  lastName: string;
  phone: string;
  photo: string;
  banner: string;
  date: Date;
  email: string;
  role: UserRole;
  bio: string;
  address: string;
  active: boolean;
}
