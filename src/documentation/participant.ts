const participantBody = {
  nombres: { type: "string" },
  apellidos: { type: "string" },
  documentoId: { type: "string" },
  fechaNacimiento: { type: "string", format: "date" },
  sexo: { type: "string", enum: ["M", "F"] },
  whatsapp: { type: "string" },
  email: { type: "string" },
  ciudad: { type: "string" },
  organizacionComunidad: { type: "string" },
  tipo: {
    type: "string",
    enum: ["misionero", "coordinador", "ponente", "sacerdote", "obispo"],
  },
  requiereAlojamiento: { type: "boolean" },
};

const authHeader = {
  name: "Authorization",
  in: "header",
  required: true,
  schema: { type: "string" },
};

const register = {
  post: {
    tags: ["Participants"],
    summary: "Registro público de participante",
    description: "Valida aforo máximo de 80. Estado inicial: registrado.",
    parameters: [
      {
        name: "body",
        in: "body",
        required: true,
        schema: {
          type: "object",
          required: [
            "nombres",
            "apellidos",
            "documentoId",
            "fechaNacimiento",
            "sexo",
            "whatsapp",
            "email",
            "ciudad",
            "organizacionComunidad",
          ],
          properties: participantBody,
        },
      },
    ],
    responses: {
      201: { description: "Registrado" },
      409: { description: "Aforo completo" },
    },
  },
};

const list = {
  get: {
    tags: ["Participants"],
    summary: "Listado de participantes (staff)",
    parameters: [
      authHeader,
      { name: "page", in: "query", type: "integer" },
      { name: "search", in: "query", type: "string" },
      { name: "estado", in: "query", type: "string" },
      { name: "tipo", in: "query", type: "string" },
    ],
    responses: { 200: { description: "OK" } },
  },
};

const stats = {
  get: {
    tags: ["Participants"],
    summary: "KPIs de aforo y acreditación",
    parameters: [authHeader],
    responses: { 200: { description: "OK" } },
  },
};

const byToken = {
  get: {
    tags: ["Participants"],
    summary: "Pase digital por token público",
    parameters: [{ name: "publicToken", in: "path", required: true, type: "string" }],
    responses: {
      200: { description: "OK" },
      403: { description: "Aún no confirmado" },
    },
  },
};

const lookup = {
  get: {
    tags: ["Participants"],
    summary: "Consulta pública de credencial por cédula",
    parameters: [{ name: "documentoId", in: "path", required: true, type: "string" }],
    responses: { 200: { description: "OK" }, 403: { description: "No confirmado" } },
  },
};

const byDocument = {
  get: {
    tags: ["Participants"],
    summary: "Buscar participante por cédula (logística)",
    parameters: [
      authHeader,
      { name: "documentoId", in: "path", required: true, type: "string" },
    ],
    responses: { 200: { description: "OK" } },
  },
};

const confirmPayment = {
  patch: {
    tags: ["Participants"],
    summary: "Validar pago y pasar a confirmado",
    parameters: [
      authHeader,
      { name: "id", in: "path", required: true, type: "string" },
      {
        name: "body",
        in: "body",
        schema: {
          type: "object",
          properties: { referenciaComprobante: { type: "string" } },
        },
      },
    ],
    responses: { 200: { description: "Confirmado" }, 409: { description: "Estado inválido" } },
  },
};

const fixTypo = {
  patch: {
    tags: ["Participants"],
    summary: "Corrección tipográfica (no cambia token ni cédula)",
    parameters: [
      authHeader,
      { name: "id", in: "path", required: true, type: "string" },
      {
        name: "body",
        in: "body",
        schema: {
          type: "object",
          properties: {
            nombres: { type: "string" },
            apellidos: { type: "string" },
            email: { type: "string" },
            whatsapp: { type: "string" },
            ciudad: { type: "string" },
            organizacionComunidad: { type: "string" },
          },
        },
      },
    ],
    responses: { 200: { description: "OK" } },
  },
};

const status = {
  patch: {
    tags: ["Participants"],
    summary: "Cancelar o marcar no asistirá (desde registrado)",
    parameters: [
      authHeader,
      { name: "id", in: "path", required: true, type: "string" },
      {
        name: "body",
        in: "body",
        schema: {
          type: "object",
          properties: { estado: { type: "string", enum: ["cancelado", "no_asistira"] } },
        },
      },
    ],
    responses: { 200: { description: "OK" } },
  },
};

const validateScan = {
  post: {
    tags: ["Scans"],
    summary: "Validar check-in o check-out por QR",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: {
          type: "object",
          required: ["publicToken", "accion"],
          properties: {
            publicToken: { type: "string" },
            accion: { type: "string", enum: ["checkin", "checkout"] },
          },
        },
      },
    ],
    responses: {
      200: { description: "OK" },
      409: { description: "Ya escaneado o estado inválido" },
    },
  },
};

export const definitions = {
  Participant: {
    properties: {
      publicToken: { type: "string" },
      ...participantBody,
      estado: { type: "string" },
    },
  },
};

const paths = {
  "/participant/register": { post: register.post },
  "/participant": { get: list.get },
  "/participant/stats": { get: stats.get },
  "/participant/by-token/{publicToken}": { get: byToken.get },
  "/participant/lookup/{documentoId}": { get: lookup.get },
  "/participant/by-document/{documentoId}": { get: byDocument.get },
  "/participant/{id}/confirm-payment": { patch: confirmPayment.patch },
  "/participant/{id}/fix-typo": { patch: fixTypo.patch },
  "/participant/{id}/status": { patch: status.patch },
  "/scan/validate": { post: validateScan.post },
};

export default paths;
