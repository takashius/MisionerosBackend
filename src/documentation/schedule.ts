const authHeader = {
  name: "Authorization",
  in: "header",
  required: true,
  schema: { type: "string" },
};

const scheduleBody = {
  fecha: { type: "string", example: "2026-09-18" },
  horaInicio: { type: "string", example: "09:00" },
  horaFin: { type: "string", example: "09:15" },
  titulo: { type: "string" },
  tipo: {
    type: "string",
    enum: ["comida", "liturgia", "formacion", "dinamica", "mesa", "panel", "recreo", "otro"],
  },
  ponente: { type: "string" },
  moderador: { type: "string" },
  descripcion: { type: "string" },
  notasLogistica: { type: "string" },
  notasCampaneros: { type: "string" },
  fichaGuion: { type: "string" },
  orden: { type: "number" },
  publicado: { type: "boolean" },
};

const paths = {
  "/schedule": {
    get: {
      tags: ["Schedule"],
      summary: "Cronograma público publicado",
      parameters: [{ name: "fecha", in: "query", type: "string" }],
      responses: { 200: { description: "OK" } },
    },
    post: {
      tags: ["Schedule"],
      summary: "Crear bloque (staff)",
      parameters: [
        authHeader,
        { name: "body", in: "body", required: true, schema: { type: "object", properties: scheduleBody } },
      ],
      responses: { 201: { description: "Creado" } },
    },
  },
  "/schedule/manage": {
    get: {
      tags: ["Schedule"],
      summary: "Cronograma completo para el panel",
      parameters: [authHeader, { name: "fecha", in: "query", type: "string" }],
      responses: { 200: { description: "OK" } },
    },
  },
  "/schedule/{id}": {
    patch: {
      tags: ["Schedule"],
      summary: "Editar bloque",
      parameters: [
        authHeader,
        { name: "id", in: "path", required: true, type: "string" },
        { name: "body", in: "body", schema: { type: "object", properties: scheduleBody } },
      ],
      responses: { 200: { description: "OK" } },
    },
    delete: {
      tags: ["Schedule"],
      summary: "Eliminar bloque",
      parameters: [authHeader, { name: "id", in: "path", required: true, type: "string" }],
      responses: { 200: { description: "OK" } },
    },
  },
};

export const definitions = {
  ScheduleItem: { properties: scheduleBody },
};

export default paths;
