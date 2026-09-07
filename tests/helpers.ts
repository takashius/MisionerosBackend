import request from "supertest";
import { server } from "../src/index";
import { User } from "../src/components/user/model";
import { ROLES, UserRole } from "../src/config/roles";

const generateUniqueId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export async function createUser(options: {
  email?: string;
  password?: string;
  name?: string;
  lastName?: string;
  role?: UserRole;
  hasLoggedInBefore?: boolean;
}) {
  const uniqueId = generateUniqueId();
  const email = options.email ?? `user-${uniqueId}@test.com`;
  const password = options.password ?? "password123";
  const user = new User({
    name: options.name ?? "Test",
    lastName: options.lastName ?? "User",
    email,
    password,
    role: options.role ?? ROLES.ADMIN,
    hasLoggedInBefore: options.hasLoggedInBefore ?? true,
    active: true,
  });
  await user.save();
  return { user, email, password };
}

export async function loginAs(email: string, password: string) {
  const res = await request(server).post("/user/login").send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${res.text}`);
  }
  return {
    token: res.body.token as string,
    body: res.body,
  };
}

export async function createAndLogin(options: {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  hasLoggedInBefore?: boolean;
}) {
  const created = await createUser(options);
  const session = await loginAs(created.email, created.password);
  return { ...created, ...session };
}
