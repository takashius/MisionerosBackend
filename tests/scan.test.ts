import request from "supertest";
import { server } from "../src/index";
import { createAndLogin } from "./helpers";
import { ROLES } from "../src/config/roles";

function sampleParticipant(overrides: Record<string, unknown> = {}) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    nombres: "Luis",
    apellidos: "Gómez",
    documentoId: `V${id.slice(-8)}`,
    fechaNacimiento: "1988-03-01",
    sexo: "M",
    whatsapp: "+584122222222",
    email: `luis-${id}@test.com`,
    ciudad: "Maracaibo",
    organizacionComunidad: "Diócesis de Maracaibo",
    tipo: "coordinador",
    ...overrides,
  };
}

describe("Scan routes", () => {
  async function confirmedParticipant() {
    const created = await request(server).post("/participant/register").send(sampleParticipant());
    const { token } = await createAndLogin({
      email: `coord-scan-${Date.now()}@test.com`,
      role: ROLES.COORDINADOR,
    });
    const confirm = await request(server)
      .patch(`/participant/${created.body._id}/confirm-payment`)
      .set("Authorization", `Bearer ${token}`)
      .send({ referenciaComprobante: "OK" });
    return confirm.body;
  }

  it("hace check-in y rechaza el segundo escaneo", async () => {
    const participant = await confirmedParticipant();
    const { token } = await createAndLogin({
      email: "log-scan@test.com",
      role: ROLES.LOGISTICA,
    });

    const first = await request(server)
      .post("/scan/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ publicToken: participant.publicToken, accion: "checkin" });
    expect(first.status).toBe(200);
    expect(first.body.participant.estado).toBe("checkin_realizado");

    const second = await request(server)
      .post("/scan/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ publicToken: participant.publicToken, accion: "checkin" });
    expect(second.status).toBe(409);
    expect(second.body.code).toBe("ALREADY_SCANNED");
    expect(second.body.fecha).toBeTruthy();
  });

  it("no permite check-out sin check-in", async () => {
    const participant = await confirmedParticipant();
    const { token } = await createAndLogin({
      email: "log-out@test.com",
      role: ROLES.LOGISTICA,
    });

    const res = await request(server)
      .post("/scan/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ publicToken: participant.publicToken, accion: "checkout" });
    expect(res.status).toBe(409);
  });

  it("COORDINADOR no puede escanear", async () => {
    const participant = await confirmedParticipant();
    const { token } = await createAndLogin({
      email: "coord-no-scan@test.com",
      role: ROLES.COORDINADOR,
    });

    const res = await request(server)
      .post("/scan/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ publicToken: participant.publicToken, accion: "checkin" });
    expect(res.status).toBe(403);
  });
});
