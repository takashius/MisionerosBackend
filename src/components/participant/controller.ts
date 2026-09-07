import {
  registerParticipant,
  listParticipants,
  getParticipantStats,
  findByToken,
  findByDocument,
  confirmPayment,
  markQrEmailSent,
  fixTypo,
  updateStatus,
  updateLodging,
} from "./store";
import { mailer } from "../../middleware/mailer";
import { getMailBranding } from "../../config/mailBranding";
import config from "../../config/commons";

export async function register(body: any) {
  return registerParticipant(body);
}

export async function list(query: {
  page?: string;
  search?: string;
  estado?: string;
  tipo?: string;
}) {
  return listParticipants({
    page: query.page ? parseInt(query.page, 10) : 1,
    search: query.search,
    estado: query.estado,
    tipo: query.tipo,
  });
}

export async function stats() {
  return getParticipantStats();
}

export async function byToken(token: string) {
  return findByToken(token);
}

export async function byDocument(documentoId: string, publicLookup = false) {
  return findByDocument(documentoId, { publicLookup });
}

export async function confirm(id: string, actorId: string, referencia?: string) {
  const result = await confirmPayment(id, actorId, referencia);
  if (result.status === 200 && result.message) {
    void sendQrEmail(result.message).catch((error) => {
      console.error("QR email failed", error);
    });
  }
  return result;
}

export async function typo(id: string, body: any) {
  return fixTypo(id, body);
}

export async function status(id: string, estado: string) {
  return updateStatus(id, estado);
}

export async function lodging(id: string, habitacionAsignada: string | null) {
  return updateLodging(id, habitacionAsignada);
}

async function sendQrEmail(participant: {
  _id: string;
  email: string;
  nombres: string;
  apellidos: string;
  publicToken: string;
}) {
  const badgeUrl = `${config.publicAppUrl.replace(/\/$/, "")}/pase/${participant.publicToken}`;
  const branding = getMailBranding();
  const html = `
    <p>Tu acreditación para la I Asamblea de Misioneros Digitales fue confirmada.</p>
    <p>Presenta este enlace o el código QR en la credencial digital:</p>
    <p><a href="${badgeUrl}">${badgeUrl}</a></p>
  `;
  const sent = await mailer(
    branding,
    participant.email,
    `${participant.nombres} ${participant.apellidos}`,
    "Tu pase digital — I Asamblea de Misioneros Digitales",
    "Acreditación confirmada",
    html,
    2
  );
  await markQrEmailSent(String(participant._id), sent === "success");
}
