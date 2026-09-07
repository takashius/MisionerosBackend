import mongoose from "mongoose";
import moment from "moment";
import validator from "validator";
import { User } from "./model";
import { removeImage } from "../../middleware/saveFile";
import { StoreResponse } from "../../types/general";
import { UserResponse } from "../../types/users";
import { buildAnchoredSearchOr } from "../../utils/searchRegex";
import { sanitizeEmailInput } from "../../utils/sanitizeEmail";
import {
  ALL_ROLES,
  ROLE_DESCRIPTIONS,
  ROLES,
  UserRole,
  assignableRolesFor,
  isUserRole,
} from "../../config/roles";

const RECOVERY_TTL_MS = 15 * 60 * 1000;
const MAX_RECOVERY_ATTEMPTS = 5;
const RECOVERY_INVALID_MESSAGE = "Código incorrecto o expirado";

const USER_PUBLIC_SELECT =
  "_id name lastName phone email photo banner bio address date role active hasLoggedInBefore";

export async function getUser(userId: string): Promise<StoreResponse> {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { status: 400, message: "User ID is required" };
    }
    const found = await User.findOne({
      _id: userId,
      $or: [{ active: true }, { active: { $exists: false } }],
    })
      .select(USER_PUBLIC_SELECT)
      .lean();

    if (!found) {
      return { status: 404, message: "User not found" };
    }
    return { status: 200, message: found };
  } catch (e) {
    console.log("getUser Store", e);
    return { status: 500, message: "Unexpected error", detail: e };
  }
}

export async function getSimple() {
  try {
    const result = await User.find({
      $or: [{ active: true }, { active: { $exists: false } }],
    })
      .select("_id name lastName")
      .sort({ name: "asc" })
      .lean();

    const data = result.map((item) => ({
      _id: item._id,
      name: `${item.name} ${item.lastName || ""}`.trim(),
    }));

    return { status: 200, message: data };
  } catch (e) {
    console.log("[ERROR] -> getSimple", e);
    return { status: 400, message: "Results error", detail: e };
  }
}

export async function getPaginate(
  filter: string,
  page: number
): Promise<StoreResponse> {
  try {
    const limit = 10;
    const baseQuery: Record<string, unknown> = {
      $or: [{ active: true }, { active: { $exists: false } }],
    };

    let query: Record<string, unknown> = baseQuery;
    if (filter) {
      query = {
        $and: [
          baseQuery,
          {
            $or: buildAnchoredSearchOr(filter, [
              "name",
              "lastName",
              "phone",
              "email",
            ]),
          },
        ],
      };
    }

    const result = await User.find(query)
      .select("name lastName phone email photo date role")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ name: "asc" })
      .lean();

    const data = result.map((item) => ({
      _id: item._id,
      fullName: `${item.name} ${item.lastName || ""}`.trim(),
      name: item.name,
      lastName: item.lastName,
      phone: item.phone,
      email: item.email,
      photo: item.photo,
      role: item.role,
      date: moment(item.date).format("DD/MM/YYYY HH:mm"),
    }));

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    const next = totalPages > page ? page + 1 : null;

    return {
      status: 200,
      message: {
        results: data,
        totalUSers: totalUsers,
        totalPages,
        currentPage: page,
        next,
      },
    };
  } catch (e) {
    console.log("[ERROR] -> getPaginate", e);
    return { status: 400, message: "Results error", detail: e };
  }
}

export async function addUser(
  user: any,
  file: any,
  actorRole: string[]
): Promise<StoreResponse> {
  try {
    if (file) user.photo = file.path;

    let role: UserRole = ROLES.PARTICIPANTE;
    if (user.role) {
      const requested = Array.isArray(user.role) ? user.role[0] : user.role;
      if (!isUserRole(requested)) {
        return { status: 400, message: "Invalid role" };
      }
      const allowed = assignableRolesFor(actorRole);
      if (!allowed.includes(requested)) {
        return { status: 403, message: "No puedes asignar ese rol" };
      }
      role = requested;
    }

    const myUser = new User({
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      password: user.password,
      photo: user.photo,
      bio: user.bio,
      address: user.address,
      role,
      hasLoggedInBefore: false,
      active: true,
    });
    await myUser.save();

    const { _id, name, lastName, photo, email, date } = myUser;
    return {
      status: 201,
      message: { _id, name, lastName, photo, email, date, role: myUser.role },
    };
  } catch (e) {
    return { status: 500, message: "User registration error", detail: e };
  }
}

export async function updateUser(
  user: any,
  file: any,
  options?: { selfProfileUpdate?: boolean; actorRole?: string[] }
): Promise<StoreResponse> {
  try {
    const foundUser = await User.findById(user._id);
    if (!foundUser) {
      throw new Error("No user found");
    }

    const selfProfile = options?.selfProfileUpdate === true;

    if (
      selfProfile &&
      user.email !== undefined &&
      user.email !== null &&
      String(user.email).trim() !== ""
    ) {
      const raw = String(user.email).trim().toLowerCase();
      const current = String(foundUser.email || "").toLowerCase();
      if (raw !== current) {
        if (foundUser.hasLoggedInBefore !== false) {
          return {
            status: 403,
            message:
              "Ya completaste la configuración inicial. El correo solo puede modificarse antes del primer cambio de contraseña.",
          };
        }
        if (!validator.isEmail(raw)) {
          return { status: 400, message: "Correo electrónico no válido." };
        }
        const dup = await User.findOne({
          email: raw,
          _id: { $ne: foundUser._id },
        })
          .select("_id")
          .lean();
        if (dup) {
          return { status: 400, message: "Este correo ya está registrado." };
        }
        foundUser.email = raw;
      }
    }

    if (user.name) foundUser.name = user.name;
    if (user.lastName) foundUser.lastName = user.lastName;
    if (user.phone) foundUser.phone = user.phone;
    if (user.bio) foundUser.bio = user.bio;
    if (user.address) foundUser.address = user.address;
    // La clave no se cambia en PATCH /user. Va por change_password o recovery.
    if (selfProfile && user.password) {
      foundUser.password = user.password;
      foundUser.hasLoggedInBefore = true;
    }

    if (!selfProfile && user.role) {
      const requested = Array.isArray(user.role) ? user.role[0] : user.role;
      if (!isUserRole(requested)) {
        return { status: 400, message: "Invalid role" };
      }
      const allowed = assignableRolesFor(options?.actorRole || []);
      if (!allowed.includes(requested)) {
        return { status: 403, message: "No puedes asignar ese rol" };
      }
      if (
        foundUser.role === ROLES.SUPER_ADMIN &&
        !(options?.actorRole || []).includes(ROLES.SUPER_ADMIN)
      ) {
        return {
          status: 403,
          message: "No puedes modificar un SUPER_ADMIN",
        };
      }
      foundUser.role = requested;
    }

    if (file) {
      if (foundUser.photo) {
        removeImage(foundUser.photo);
      }
      foundUser.photo = file.path;
    }

    try {
      await foundUser.save();
    } catch (saveErr: any) {
      if (saveErr?.code === 11000) {
        return {
          status: 400,
          message: "Este correo ya está registrado.",
          detail: saveErr,
        };
      }
      throw saveErr;
    }

    const { _id, name, lastName, photo, email, date, active, role } = foundUser;
    return {
      status: 200,
      message: { _id, name, lastName, photo, email, date, active, role },
    };
  } catch (e) {
    return { status: 500, message: "Unexpected store error", detail: e };
  }
}

export async function deleteUser(id: string): Promise<StoreResponse> {
  try {
    const foundUser = await User.findOne({ _id: id });
    if (!foundUser) {
      throw new Error("No user found");
    }
    if (foundUser.role === ROLES.SUPER_ADMIN) {
      return { status: 403, message: "No se puede eliminar un SUPER_ADMIN" };
    }
    foundUser.active = false;
    await foundUser.save();
    return { status: 200, message: "User deleted" };
  } catch (e) {
    return { status: 500, message: "Unexpected store error", detail: e };
  }
}

export async function loginUser(
  mail: string,
  pass: string
): Promise<StoreResponse> {
  try {
    const user = await User.findByCredentials(mail, pass);
    if (user.active === false) {
      return { status: 401, message: "User or password incorrect" };
    }

    const isFirstLogin = user.hasLoggedInBefore === false;
    const token = await user.generateAuthToken();
    const response = {
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      photo: user.photo,
      email: user.email,
      date: user.date,
      role: [user.role],
      isFirstLogin,
      token,
    };
    return { status: 200, message: response };
  } catch (error: any) {
    if (error?.message?.includes("Invalid login credentials")) {
      return { status: 401, message: "User or password incorrect" };
    }
    console.error("ERROR STORE LOGIN - Error inesperado:", error);
    return { status: 401, message: "User or password incorrect" };
  }
}

export async function logoutUser(id: string, tokenUser: string): Promise<void> {
  const foundUser = await User.findOne({ _id: id });
  if (!foundUser) {
    throw new Error("No user found");
  }
  foundUser.tokens = foundUser.tokens.filter((token: any) => {
    return token.token != tokenUser;
  });
  await foundUser.save();
}

export async function logoutAll(id: string) {
  const foundUser = await User.findOne({ _id: id });
  if (!foundUser) {
    throw new Error("No user found");
  }
  foundUser.tokens.splice(0, foundUser.tokens.length);
  await foundUser.save();
}

export async function changePassword(
  user: any,
  newPass: string
): Promise<StoreResponse> {
  try {
    const foundUser = await User.findOne({ email: user.email });
    if (!foundUser) {
      throw new Error("No user found");
    }
    foundUser.password = newPass;
    let error: unknown = false;
    await foundUser.save().catch(function (err) {
      error = err;
    });
    if (error) {
      return { status: 500, message: "Unexpected error", detail: error };
    }
    return { status: 200, message: "Password changed successfully" };
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected error", detail: e };
  }
}

export async function changePasswordByUserId(
  userId: string,
  newPass: string
): Promise<StoreResponse> {
  try {
    if (!userId || !newPass) {
      return { status: 400, message: "User ID and password are required" };
    }

    const foundUser = await User.findOne({ _id: userId });
    if (!foundUser) {
      return { status: 404, message: "User not found" };
    }

    foundUser.password = newPass;
    let error: unknown = false;
    await foundUser.save().catch(function (err) {
      error = err;
    });
    if (error) {
      return { status: 500, message: "Unexpected error", detail: error };
    }
    return { status: 200, message: "Password changed successfully" };
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected error", detail: e };
  }
}

export async function recoveryStepOne(
  email: string,
  code: number
): Promise<{ status: boolean; user?: UserResponse; text?: string }> {
  try {
    const normalizedEmail = sanitizeEmailInput(email);
    if (!normalizedEmail) {
      return { status: false };
    }

    const foundUser = await User.findOne({
      email: normalizedEmail,
      $or: [{ active: true }, { active: { $exists: false } }],
    });
    if (!foundUser) {
      return { status: false };
    }

    foundUser.recovery = [
      {
        code: `${code}`,
        expiresAt: new Date(Date.now() + RECOVERY_TTL_MS),
        attempts: 0,
      },
    ];
    await foundUser.save();
    return { status: true, user: foundUser };
  } catch (e) {
    console.log("ERROR -> recoveryStepOne ", e);
    return { status: false };
  }
}

export async function recoveryStepTwo(
  email: string,
  code: string,
  newPass: string
): Promise<{ status: boolean; user?: UserResponse; text?: string }> {
  try {
    const normalizedEmail = sanitizeEmailInput(email);
    const normalizedCode = typeof code === "string" ? code.trim() : "";

    if (!normalizedEmail || !normalizedCode) {
      return { status: false, text: RECOVERY_INVALID_MESSAGE };
    }

    const foundUser = await User.findOne({
      email: normalizedEmail,
      $or: [{ active: true }, { active: { $exists: false } }],
    });
    if (!foundUser) {
      return { status: false, text: RECOVERY_INVALID_MESSAGE };
    }

    const recoveryEntry = foundUser.recovery?.[0];
    if (!recoveryEntry?.code) {
      return { status: false, text: RECOVERY_INVALID_MESSAGE };
    }

    if (
      recoveryEntry.expiresAt &&
      new Date(recoveryEntry.expiresAt).getTime() < Date.now()
    ) {
      foundUser.recovery.splice(0, foundUser.recovery.length);
      await foundUser.save();
      return { status: false, text: RECOVERY_INVALID_MESSAGE };
    }

    if (recoveryEntry.code !== normalizedCode) {
      recoveryEntry.attempts = (recoveryEntry.attempts || 0) + 1;
      if (recoveryEntry.attempts >= MAX_RECOVERY_ATTEMPTS) {
        foundUser.recovery.splice(0, foundUser.recovery.length);
      }
      await foundUser.save();
      return { status: false, text: RECOVERY_INVALID_MESSAGE };
    }

    if (newPass.length < 8) {
      return {
        status: false,
        text: "Your password must contain at least 8 characters",
      };
    }

    foundUser.password = newPass;
    foundUser.recovery.splice(0, foundUser.recovery.length);
    await foundUser.save();
    return { status: true, user: foundUser };
  } catch (e) {
    console.log("ERROR -> recoveryStepTwo ", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    if (errorMessage.includes("password")) {
      return {
        status: false,
        text: "Your password must contain at least 8 characters",
      };
    }
    return { status: false, text: "Error al cambiar la contraseña" };
  }
}

export async function uploadImage(
  id: string,
  file: any,
  type: string
): Promise<StoreResponse> {
  try {
    if (!file?.path) {
      return {
        status: 400,
        message:
          "No se recibió archivo de imagen. Envíe multipart con campo 'image' o 'photo'.",
      };
    }

    const foundUser = await User.findOne({ _id: id });
    if (!foundUser) {
      return { status: 404, message: "User not found" };
    }

    if (type === "photo") {
      if (foundUser.photo) {
        removeImage(foundUser.photo);
      }
      foundUser.photo = file.path;
    }
    if (type === "banner") {
      if (foundUser.banner) {
        removeImage(foundUser.banner);
      }
      foundUser.banner = file.path;
    }
    await foundUser.save();
    return { status: 200, message: file };
  } catch (e) {
    console.log("[ERROR] -> user -> uploadImage", e);
    return {
      status: 400,
      message: "An error occurred while updating the user image",
      detail: e,
    };
  }
}

export async function getRoles(): Promise<StoreResponse> {
  return {
    status: 200,
    message: ALL_ROLES.map((name) => ({
      name,
      description: ROLE_DESCRIPTIONS[name],
    })),
  };
}

export async function updateUserRoles(
  userId: string,
  newRole: unknown,
  actorRole: string[]
): Promise<StoreResponse> {
  try {
    const requested = Array.isArray(newRole) ? newRole[0] : newRole;
    if (!isUserRole(requested)) {
      return { status: 400, message: "Invalid role" };
    }
    const allowed = assignableRolesFor(actorRole);
    if (!allowed.includes(requested)) {
      return { status: 403, message: "No puedes asignar ese rol" };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (
      user.role === ROLES.SUPER_ADMIN &&
      !actorRole.includes(ROLES.SUPER_ADMIN)
    ) {
      return { status: 403, message: "No puedes modificar un SUPER_ADMIN" };
    }
    user.role = requested;
    await user.save();
    return { status: 200, message: "User roles updated successfully" };
  } catch (error) {
    return { status: 500, message: "Unexpected store error", detail: error };
  }
}
