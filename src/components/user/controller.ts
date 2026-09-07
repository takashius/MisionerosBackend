import {
  getUser as _getUser,
  addUser as _addUser,
  getSimple,
  getPaginate,
  updateUser as update,
  deleteUser as _deleteUser,
  loginUser as login,
  logoutUser as logout,
  logoutAll as _logoutAll,
  changePassword as _changePassword,
  changePasswordByUserId as _changePasswordByUserId,
  recoveryStepOne as _recoveryStepOne,
  recoveryStepTwo as _recoveryStepTwo,
  updateUserRoles as _updateUserRoles,
  uploadImage as _uploadImage,
  getRoles as _getRoles,
} from "./store";
import { mailer } from "../../middleware/mailer";
import { getMailBranding } from "../../config/mailBranding";
import { randomInt } from "crypto";
import { sanitizeEmailInput } from "../../utils/sanitizeEmail";
import { ROLE_DESCRIPTIONS, isSuperAdminRole } from "../../config/roles";

export async function getUsers(
  filter: string | null,
  page: number | null,
  simple: boolean
) {
  try {
    const resolvedPage = !page || page < 1 ? 1 : page;
    const resolvedFilter = filter === "" || filter == null ? null : filter;
    const newArray: Array<{ id: unknown; name: string }> = [];

    if (simple) {
      const result = await getSimple();
      if (Array.isArray(result.message)) {
        result.message.forEach((item: any) => {
          newArray.push({
            id: item._id,
            name: item.name,
          });
        });
      }
      return { status: result.status, message: newArray };
    }

    const result = await getPaginate(resolvedFilter ?? "", resolvedPage);
    return { status: result.status, message: result.message };
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected error", detail: e };
  }
}

export async function getUser(id: string) {
  try {
    if (!id) {
      return { status: 400, message: "User ID is required" };
    }
    const result = await _getUser(id);
    if (result.status !== 200 || !result.message) {
      return {
        status: result.status === 400 ? 404 : result.status,
        message: result.message || "User not found",
      };
    }
    return {
      status: result.status,
      message: {
        _id: result.message._id,
        name: result.message.name,
        lastName: result.message.lastName,
        email: result.message.email,
        date: result.message.date,
        phone: result.message.phone,
        photo: result.message.photo,
        banner: result.message.banner,
        bio: result.message.bio,
        address: result.message.address,
        role: [result.message.role],
        active: result.message.active,
      },
    };
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function addUser(user: any, file: any, actorRole: string[]) {
  try {
    return await _addUser(user, file, actorRole);
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function updateUser(user: any, file: any, actorRole: string[]) {
  try {
    if (!user._id) {
      return { status: 400, message: "No user ID received" };
    }
    return await update(user, file, { actorRole });
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function updateProfile(id: string, user: any, file?: any) {
  try {
    user._id = id;
    return await update(user, file ?? null, { selfProfileUpdate: true });
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function deleteUser(id: string) {
  try {
    return await _deleteUser(id);
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function loginUser(user: any) {
  try {
    const { email, password } = user;
    if (!email || !password) {
      return { status: 400, message: "Email and password are required" };
    }
    return await login(email, password);
  } catch (e: any) {
    if (
      e?.message?.includes("Invalid login credentials") ||
      e?.message?.includes("credentials") ||
      e?.message?.includes("User or password")
    ) {
      return { status: 401, message: "User or password incorrect" };
    }
    console.error("ERROR CONTROLLER LOGIN - Error inesperado:", e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e?.message || e,
    };
  }
}

export async function logoutUser(id: string, token: string) {
  try {
    return await logout(id, token);
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function logoutAll(id: string) {
  try {
    return await _logoutAll(id);
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function changePassword(user: any, newPass: string) {
  try {
    if (!user || !newPass) {
      return { status: 400, message: "User or Password not received" };
    }
    return _changePassword(user, newPass);
  } catch (e) {
    return { status: 500, message: "Unexpected error", detail: e };
  }
}

export async function changePasswordByUserId(userId: string, newPass: string) {
  try {
    if (!userId || !newPass) {
      return { status: 400, message: "User ID and password are required" };
    }
    return _changePasswordByUserId(userId, newPass);
  } catch (e) {
    return { status: 500, message: "Unexpected error", detail: e };
  }
}

export async function recoveryStepOne(mail: string) {
  const uniformMessage =
    "Si el correo está registrado, recibirás un código de recuperación.";

  try {
    const email = sanitizeEmailInput(mail);
    if (!email) {
      return { status: 200, message: uniformMessage };
    }

    const code = randomInt(100000, 1000000);
    const foundUser = await _recoveryStepOne(email, code);
    if (foundUser.status && foundUser.user) {
      const branding = getMailBranding();
      const message = `
    <p>Ha solicitado restaurar su clave de acceso, copia el siguiente código en la pantalla de la aplicación para reestablecer su contraseña.</br>
    Si usted no solicitó este correo solo debe ignorarlo.</p>
    <p>
      Sus código es el siguiente: </br>
      <center>
        <h1 style="color: #153643; font-family: Arial, sans-serif; font-size: 42px;">${code}</h1>
      </center>
    </p>
    `;
      mailer(
        branding,
        email,
        `${foundUser.user?.name} ${foundUser.user?.lastName ? foundUser.user?.lastName : ""}`,
        "Recuperar contraseña",
        "Recuperación de clave",
        message,
        2
      );
    }
    return { status: 200, message: uniformMessage };
  } catch (e) {
    console.log(e);
    return { status: 200, message: uniformMessage };
  }
}

export async function recoveryStepTwo(data: any) {
  try {
    const email = sanitizeEmailInput(data?.email);
    const code = typeof data?.code === "string" ? data.code.trim() : "";

    if (!email || !code) {
      return { status: 400, message: "Código incorrecto o expirado" };
    }

    if (data.newPass && data.newPass.length < 8) {
      return {
        status: 400,
        message: "Your password must contain at least 8 characters",
      };
    }

    const foundUser = await _recoveryStepTwo(email, code, data.newPass);
    if (!foundUser.status) {
      return {
        status: 400,
        message: foundUser.text || "Código incorrecto o expirado",
      };
    }

    const branding = getMailBranding();
    const message = `
    <p>Se ha cambiado su contraseña exitosamente.</p>
    `;
    mailer(
      branding,
      email,
      `${foundUser.user?.name} ${foundUser.user?.lastName}`,
      "Cambio de clave exitoso",
      "Cambio de clave",
      message,
      2
    );
    return {
      status: 200,
      message: "Your password has been changed successfully",
    };
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function uploadImage(userId: any, file: any, type: string) {
  try {
    const id =
      typeof userId === "string" ? userId : userId?._id?.toString?.() || "";
    if (!id) {
      return { status: 400, message: "User ID is required" };
    }
    return await _uploadImage(id, file, type);
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function updateUserRoles(
  targetUserId: string,
  roles: any,
  actorRole: string[]
) {
  try {
    return await _updateUserRoles(targetUserId, roles, actorRole);
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected controller error", detail: e };
  }
}

export async function getRoles(user: any) {
  try {
    const result = await _getRoles();
    const list = result.message;
    const actorIsSuperAdmin = isSuperAdminRole(user?.role);

    return {
      status: 200,
      message: list
        .filter((role: { name: string }) =>
          actorIsSuperAdmin ? true : role.name !== "SUPER_ADMIN"
        )
        .map((role: { name: string; description: string }) => ({
          name: role.name,
          description: ROLE_DESCRIPTIONS[role.name as keyof typeof ROLE_DESCRIPTIONS] || role.description,
          disabled: false,
        })),
    };
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Unexpected Controller error", detail: e };
  }
}
