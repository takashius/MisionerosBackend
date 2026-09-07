import request from "supertest";
import { server } from "../src/index";
import { createAndLogin, createUser } from "./helpers";
import { ROLES } from "../src/config/roles";

describe("Authentication Routes", () => {
  it("no expone registro público", async () => {
    const res = await request(server).post("/user/register").send({
      name: "Auth User",
      email: "auth@test.com",
      password: "password123",
    });

    expect(res.status).toBe(404);
  });

  it("hace login de un usuario creado", async () => {
    await createUser({
      name: "Auth User",
      email: "auth@test.com",
      role: ROLES.ADMIN,
    });

    const res = await request(server).post("/user/login").send({
      email: "auth@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.name).toBe("Auth User");
    expect(res.body.role).toEqual([ROLES.ADMIN]);
    expect(res.body.isFirstLogin).toBe(false);
  });

  it("falla login con contraseña incorrecta", async () => {
    const res = await request(server).post("/user/login").send({
      email: "auth@test.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  it("falla login con email inexistente", async () => {
    const res = await request(server).post("/user/login").send({
      email: "nonexistent@test.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });

  it("falla login sin email", async () => {
    const res = await request(server).post("/user/login").send({
      password: "password123",
    });

    expect([400, 401]).toContain(res.status);
  });

  it("falla login sin password", async () => {
    const res = await request(server).post("/user/login").send({
      email: "auth@test.com",
    });

    expect([400, 401]).toContain(res.status);
  });

  it("cierra sesión y revoca el token", async () => {
    const { token } = await createAndLogin({
      email: "logout@test.com",
      role: ROLES.ADMIN,
    });

    const logoutRes = await request(server)
      .post("/user/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutRes.status).toBe(200);

    const accountRes = await request(server)
      .get("/user/account")
      .set("Authorization", `Bearer ${token}`);

    expect(accountRes.status).toBe(401);
  });

  it("marca isFirstLogin cuando hasLoggedInBefore es false", async () => {
    await createUser({
      email: "first@test.com",
      role: ROLES.PARTICIPANTE,
      hasLoggedInBefore: false,
    });

    const res = await request(server).post("/user/login").send({
      email: "first@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.isFirstLogin).toBe(true);
  });
});
