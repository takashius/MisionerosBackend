import request from "supertest";
import { server } from "../src/index";

describe("Contact routes", () => {
  it("recibe un mensaje público", async () => {
    const res = await request(server).post("/contact").send({
      nombre: "Ana Pérez",
      email: "ana@test.com",
      telefono: "+584121111111",
      asunto: "Acreditación",
      mensaje: "Quiero confirmar el horario de llegada a la sede.",
    });
    expect(res.status).toBe(201);
    expect(res.body.received).toBe(true);
  });

  it("rechaza un correo inválido", async () => {
    const res = await request(server).post("/contact").send({
      nombre: "Ana Pérez",
      email: "no-es-correo",
      asunto: "Consulta",
      mensaje: "Mensaje de prueba con más de diez caracteres.",
    });
    expect(res.status).toBe(400);
  });
});
