import { User } from "../components/user/model";
import config from "../config/commons";
import { ROLES } from "../config/roles";

/** Crea el SUPER_ADMIN inicial si no existe ninguno y hay credenciales en env. */
export default async function seedDefaultAdmin() {
  const existing = await User.findOne({ role: ROLES.SUPER_ADMIN }).select("_id");
  if (existing) {
    return;
  }

  const email = config.userAdminEmail?.trim().toLowerCase();
  const password = config.userAdminPassword;
  if (!email || !password) {
    console.warn(
      "[seed] No hay SUPER_ADMIN y faltan USER_ADMIN_EMAIL / USER_ADMIN_PASSWORD"
    );
    return;
  }

  const already = await User.findOne({ email }).select("_id");
  if (already) {
    await User.updateOne({ _id: already._id }, { $set: { role: ROLES.SUPER_ADMIN } });
    console.log(`[seed] Usuario ${email} promovido a SUPER_ADMIN`);
    return;
  }

  await User.create({
    name: config.userAdminName,
    email,
    password,
    role: ROLES.SUPER_ADMIN,
    hasLoggedInBefore: true,
    active: true,
  });
  console.log(`[seed] SUPER_ADMIN creado: ${email}`);
}
