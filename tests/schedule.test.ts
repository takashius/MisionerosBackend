import request from "supertest";
import { server } from "../src/index";
import { ROLES } from "../src/config/roles";
import { createAndLogin } from "./helpers";

const sampleBlock = {
  fecha: "2026-09-21",
  horaInicio: "09:00",
  horaFin: "10:00",
  titulo: "Ensayo de cronograma",
  tipo: "formacion",
  ponente: "Equipo CEV",
  publicado: true,
};

describe("Schedule routes", () => {
  it("lista el cronograma público sin autenticación", async () => {
    const res = await request(server).get("/schedule");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("ADMIN crea, edita y elimina un bloque", async () => {
    const admin = await createAndLogin({ role: ROLES.ADMIN });
    const created = await request(server)
      .post("/schedule")
      .set("Authorization", `Bearer ${admin.token}`)
      .send(sampleBlock);
    expect(created.status).toBe(201);
    expect(created.body.titulo).toBe(sampleBlock.titulo);

    const updated = await request(server)
      .patch(`/schedule/${created.body._id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ ...sampleBlock, titulo: "Bloque actualizado" });
    expect(updated.status).toBe(200);
    expect(updated.body.titulo).toBe("Bloque actualizado");

    const removed = await request(server)
      .delete(`/schedule/${created.body._id}`)
      .set("Authorization", `Bearer ${admin.token}`);
    expect(removed.status).toBe(200);
  });

  it("PARTICIPANTE no puede crear bloques", async () => {
    const attendee = await createAndLogin({ role: ROLES.PARTICIPANTE });
    const res = await request(server)
      .post("/schedule")
      .set("Authorization", `Bearer ${attendee.token}`)
      .send(sampleBlock);
    expect(res.status).toBe(403);
  });

  it("no publica notas internas en el listado público", async () => {
    const admin = await createAndLogin({ role: ROLES.ADMIN });
    await request(server)
      .post("/schedule")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        ...sampleBlock,
        titulo: "Bloque interno visible",
        fichaGuion: "Texto de staff",
        notasLogistica: "Solo logística",
      });

    const res = await request(server).get("/schedule");
    expect(res.status).toBe(200);
    const found = res.body.find((item: any) => item.titulo === "Bloque interno visible");
    expect(found).toBeTruthy();
    expect(found.fichaGuion).toBeUndefined();
    expect(found.notasLogistica).toBeUndefined();
  });
});
