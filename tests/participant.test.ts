import request from "supertest";
import { server } from "../src/index";
import { createAndLogin } from "./helpers";
import { ROLES } from "../src/config/roles";
import { CAPACITY_MAX } from "../src/config/event";
import { Participant } from "../src/components/participant/model";

function sampleParticipant(overrides: Record<string, unknown> = {}) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    nombres: "Ana",
    apellidos: "Pérez",
    documentoId: `V${id.slice(-8)}`,
    fechaNacimiento: "1990-05-12",
    sexo: "F",
    whatsapp: "+584121111111",
    email: `ana-${id}@test.com`,
    ciudad: "Caracas",
    organizacionComunidad: "Arquidiócesis de Caracas",
    tipo: "misionero",
    ...overrides,
  };
}

describe("Participant routes", () => {
  it("registra un participante público", async () => {
    const res = await request(server).post("/participant/register").send(sampleParticipant());
    expect(res.status).toBe(201);
    expect(res.body.estado).toBe("registrado");
    expect(res.body.publicToken).toBeTruthy();
    expect(res.body.documentoId).toMatch(/^V/);
  });

  it("permite registrar sin fecha de nacimiento", async () => {
    const { fechaNacimiento: _omit, ...payload } = sampleParticipant();
    const res = await request(server).post("/participant/register").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.fechaNacimiento == null).toBe(true);
  });

  it("permite registrar solo con nombre, apellido, cédula y correo", async () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const res = await request(server).post("/participant/register").send({
      nombres: "Luis",
      apellidos: "Mora",
      documentoId: `V${id.slice(-8)}`,
      email: `minimo-${id}@test.com`,
    });
    expect(res.status).toBe(201);
    expect(res.body.sexo).toBeUndefined();
    expect(res.body.whatsapp).toBeUndefined();
  });

  it("guarda los datos opcionales de la planilla", async () => {
    const res = await request(server).post("/participant/register").send(
      sampleParticipant({
        edad: 34,
        arquidiocesis: "Arquidiócesis de Caracas",
        redesSociales: "@misionero",
        estadoVida: "Casado/a",
        telefonoEmergencia: "+584121000000",
        tieneAlergiaEnfermedad: true,
        alergiasEnfermedadDetalle: "Maní",
        pagoInscripcion: {
          titular: "Ana Pérez",
          banco: "Banesco",
          referencia: "REF-99",
          monto: "150",
          tasaBcv: "36.50",
        },
      })
    );
    expect(res.status).toBe(201);
    expect(res.body.edad).toBe(34);
    expect(res.body.arquidiocesis).toBe("Arquidiócesis de Caracas");
    expect(res.body.pagoInscripcion.referencia).toBe("REF-99");
    expect(res.body.alergiasEnfermedadDetalle).toBe("Maní");
  });

  it("rechaza documento duplicado", async () => {
    const payload = sampleParticipant({ documentoId: "V19999999" });
    await request(server).post("/participant/register").send(payload);
    const res = await request(server)
      .post("/participant/register")
      .send({ ...payload, email: "otra@test.com" });
    expect(res.status).toBe(400);
  });

  it("bloquea el aforo máximo", async () => {
    await Participant.insertMany(
      Array.from({ length: CAPACITY_MAX }, (_, index) => ({
        publicToken: `token-cap-${index}`,
        nombres: "Cupo",
        apellidos: `N${index}`,
        documentoId: `CAP${index}`,
        fechaNacimiento: new Date("1990-01-01"),
        sexo: "M",
        whatsapp: "+580000000000",
        email: `cupo${index}@test.com`,
        ciudad: "Caracas",
        organizacionComunidad: "CEV",
        tipo: "misionero",
        estado: "registrado",
      }))
    );

    const res = await request(server).post("/participant/register").send(sampleParticipant());
    expect(res.status).toBe(409);
    await Participant.deleteMany({ documentoId: /^CAP/ });
  });

  it("COORDINADOR confirma pago y habilita el pase", async () => {
    const created = await request(server).post("/participant/register").send(sampleParticipant());
    const { token } = await createAndLogin({
      email: "coord-pay@test.com",
      role: ROLES.COORDINADOR,
    });

    const confirm = await request(server)
      .patch(`/participant/${created.body._id}/confirm-payment`)
      .set("Authorization", `Bearer ${token}`)
      .send({ referenciaComprobante: "PAGO-1" });

    expect(confirm.status).toBe(200);
    expect(confirm.body.estado).toBe("confirmado");
    expect(confirm.body.pagoValidado.validado).toBe(true);

    const badge = await request(server).get(`/participant/by-token/${confirm.body.publicToken}`);
    expect(badge.status).toBe(200);
    expect(badge.body.nombres).toBe("Ana");
  });

  it("PARTICIPANTE no lista ni confirma pagos", async () => {
    const created = await request(server).post("/participant/register").send(sampleParticipant());
    const { token } = await createAndLogin({
      email: "part-pay@test.com",
      role: ROLES.PARTICIPANTE,
    });

    const list = await request(server)
      .get("/participant")
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(403);

    const confirm = await request(server)
      .patch(`/participant/${created.body._id}/confirm-payment`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(confirm.status).toBe(403);
  });

  it("lookup público no entrega pase si no está confirmado", async () => {
    const created = await request(server)
      .post("/participant/register")
      .send(sampleParticipant({ documentoId: "V18888888" }));
    const res = await request(server).get(`/participant/lookup/${created.body.documentoId}`);
    expect(res.status).toBe(403);
  });

  it("LOGISTICA corrige tipografía sin cambiar el token", async () => {
    const created = await request(server).post("/participant/register").send(sampleParticipant());
    const { token } = await createAndLogin({
      email: "log-typo@test.com",
      role: ROLES.LOGISTICA,
    });

    const res = await request(server)
      .patch(`/participant/${created.body._id}/fix-typo`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nombres: "Anita", publicToken: "hack", documentoId: "HACK" });

    expect(res.status).toBe(200);
    expect(res.body.nombres).toBe("Anita");
    expect(res.body.publicToken).toBe(created.body.publicToken);
    expect(res.body.documentoId).toBe(created.body.documentoId);
  });
});
