import request from "supertest";
import { server } from "../src/index";
import { createAndLogin } from "./helpers";
import { ROLES } from "../src/config/roles";

describe("User Routes", () => {
  it("lista usuarios para ADMIN", async () => {
    const { token } = await createAndLogin({
      email: "admin-list@test.com",
      role: ROLES.ADMIN,
    });

    const res = await request(server)
      .get("/user/list/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it("bloquea listado a PARTICIPANTE", async () => {
    const { token } = await createAndLogin({
      email: "part-list@test.com",
      role: ROLES.PARTICIPANTE,
    });

    const res = await request(server)
      .get("/user/list/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("INSUFFICIENT_PERMISSIONS");
  });

  it("crea un usuario como SUPER_ADMIN", async () => {
    const { token } = await createAndLogin({
      email: "super@test.com",
      role: ROLES.SUPER_ADMIN,
    });

    const res = await request(server)
      .post("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Nuevo",
        lastName: "Misionero",
        email: "nuevo.misionero@test.com",
        password: "password123",
        role: ROLES.MISIONERO,
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("nuevo.misionero@test.com");
    expect(res.body.role).toBe(ROLES.MISIONERO);
  });

  it("ADMIN no puede crear SUPER_ADMIN", async () => {
    const { token } = await createAndLogin({
      email: "admin-create@test.com",
      role: ROLES.ADMIN,
    });

    const res = await request(server)
      .post("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Hack",
        email: "hack@test.com",
        password: "password123",
        role: ROLES.SUPER_ADMIN,
      });

    expect(res.status).toBe(403);
  });

  it("MISIONERO no puede crear usuarios", async () => {
    const { token } = await createAndLogin({
      email: "mis-create@test.com",
      role: ROLES.MISIONERO,
    });

    const res = await request(server)
      .post("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Otro",
        email: "otro@test.com",
        password: "password123",
      });

    expect(res.status).toBe(403);
  });

  it("devuelve la cuenta del usuario autenticado", async () => {
    const { token, user } = await createAndLogin({
      email: "account@test.com",
      name: "Cuenta",
      role: ROLES.PARTICIPANTE,
    });

    const res = await request(server)
      .get("/user/account")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("account@test.com");
    expect(res.body._id.toString()).toBe(user._id.toString());
  });

  it("lista roles para ADMIN sin SUPER_ADMIN", async () => {
    const { token } = await createAndLogin({
      email: "roles-admin@test.com",
      role: ROLES.ADMIN,
    });

    const res = await request(server)
      .get("/user/roles")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const names = res.body.map((r: { name: string }) => r.name);
    expect(names).toContain(ROLES.ADMIN);
    expect(names).not.toContain(ROLES.SUPER_ADMIN);
  });

  it("lista todos los roles para SUPER_ADMIN", async () => {
    const { token } = await createAndLogin({
      email: "roles-super@test.com",
      role: ROLES.SUPER_ADMIN,
    });

    const res = await request(server)
      .get("/user/roles")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const names = res.body.map((r: { name: string }) => r.name);
    expect(names).toEqual(
      expect.arrayContaining([
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.COORDINADOR,
        ROLES.LOGISTICA,
        ROLES.MISIONERO,
        ROLES.PARTICIPANTE,
      ])
    );
  });
});
