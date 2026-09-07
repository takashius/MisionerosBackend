import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { Participant } from "./model";
import { StoreResponse } from "../../types/general";
import { buildAnchoredSearchOr } from "../../utils/searchRegex";
import { sanitizeEmailInput } from "../../utils/sanitizeEmail";
import {
  ACTIVE_REGISTRATION_STATES,
  BADGE_STATES,
  CAPACITY_MAX,
  LODGING_SLOTS,
  isParticipantState,
  isParticipantType,
  normalizeDocumentoId,
  type ParticipantState,
  type ParticipantType,
} from "../../config/event";

const TYPO_FIELDS = [
  "nombres",
  "apellidos",
  "email",
  "whatsapp",
  "ciudad",
  "organizacionComunidad",
] as const;

export function toPublicParticipant(item: any) {
  return {
    _id: item._id,
    publicToken: item.publicToken,
    nombres: item.nombres,
    apellidos: item.apellidos,
    documentoId: item.documentoId,
    fechaNacimiento: item.fechaNacimiento,
    sexo: item.sexo,
    whatsapp: item.whatsapp,
    email: item.email,
    ciudad: item.ciudad,
    organizacionComunidad: item.organizacionComunidad,
    tipo: item.tipo,
    estado: item.estado,
    requiereAlojamiento: item.requiereAlojamiento,
    habitacionAsignada: item.habitacionAsignada ?? null,
    pagoValidado: item.pagoValidado,
    comunicaciones: item.comunicaciones,
    createdAt: item.createdAt,
  };
}

export function toBadgeParticipant(item: any) {
  return {
    publicToken: item.publicToken,
    nombres: item.nombres,
    apellidos: item.apellidos,
    documentoId: item.documentoId,
    tipo: item.tipo,
    estado: item.estado,
    organizacionComunidad: item.organizacionComunidad,
    ciudad: item.ciudad,
    requiereAlojamiento: item.requiereAlojamiento,
    habitacionAsignada: item.habitacionAsignada ?? null,
  };
}

export async function countActiveRegistrations(): Promise<number> {
  return Participant.countDocuments({
    estado: { $in: ACTIVE_REGISTRATION_STATES },
  });
}

export async function registerParticipant(data: any): Promise<StoreResponse> {
  try {
    const documentoId = normalizeDocumentoId(String(data.documentoId || ""));
    const email = sanitizeEmailInput(data.email);
    if (!documentoId) {
      return { status: 400, message: "Documento de identidad requerido" };
    }
    if (!email) {
      return { status: 400, message: "Correo electrónico no válido" };
    }

    const required = [
      "nombres",
      "apellidos",
      "fechaNacimiento",
      "sexo",
      "whatsapp",
      "ciudad",
      "organizacionComunidad",
    ];
    for (const field of required) {
      if (!data[field] || String(data[field]).trim() === "") {
        return { status: 400, message: `El campo ${field} es obligatorio` };
      }
    }

    if (!["M", "F"].includes(data.sexo)) {
      return { status: 400, message: "Sexo inválido" };
    }

    const tipo: ParticipantType = isParticipantType(data.tipo) ? data.tipo : "misionero";
    const active = await countActiveRegistrations();
    if (active >= CAPACITY_MAX) {
      return {
        status: 409,
        message: `Aforo completo (${CAPACITY_MAX} participantes)`,
      };
    }

    const duplicate = await Participant.findOne({
      $or: [{ documentoId }, { email }],
    }).select("_id documentoId email");
    if (duplicate) {
      return {
        status: 400,
        message:
          duplicate.documentoId === documentoId
            ? "Ya existe un registro con ese documento"
            : "Ya existe un registro con ese correo",
      };
    }

    const created = await Participant.create({
      publicToken: randomUUID(),
      nombres: String(data.nombres).trim(),
      apellidos: String(data.apellidos).trim(),
      documentoId,
      fechaNacimiento: data.fechaNacimiento,
      sexo: data.sexo,
      whatsapp: String(data.whatsapp).trim(),
      email,
      ciudad: String(data.ciudad).trim(),
      organizacionComunidad: String(data.organizacionComunidad).trim(),
      tipo,
      estado: "registrado",
      requiereAlojamiento: data.requiereAlojamiento !== false,
    });

    return { status: 201, message: toPublicParticipant(created) };
  } catch (e: any) {
    if (e?.code === 11000) {
      return { status: 400, message: "Documento o correo ya registrado", detail: e };
    }
    return { status: 500, message: "Error al registrar participante", detail: e };
  }
}

export async function listParticipants(options: {
  page?: number;
  search?: string;
  estado?: string;
  tipo?: string;
}): Promise<StoreResponse> {
  try {
    const page = !options.page || options.page < 1 ? 1 : options.page;
    const limit = 10;
    const query: Record<string, unknown> = {};

    if (options.estado && isParticipantState(options.estado)) {
      query.estado = options.estado;
    }
    if (options.tipo && isParticipantType(options.tipo)) {
      query.tipo = options.tipo;
    }
    if (options.search?.trim()) {
      const needle = options.search.trim();
      const normalized = normalizeDocumentoId(needle);
      query.$or = [
        ...buildAnchoredSearchOr(needle, [
          "nombres",
          "apellidos",
          "email",
          "organizacionComunidad",
          "ciudad",
        ]),
        ...(normalized ? [{ documentoId: new RegExp(`^${normalized}`, "i") }] : []),
      ];
    }

    const [results, total] = await Promise.all([
      Participant.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Participant.countDocuments(query),
    ]);

    return {
      status: 200,
      message: {
        results: results.map(toPublicParticipant),
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        next: Math.ceil(total / limit) > page ? page + 1 : null,
      },
    };
  } catch (e) {
    return { status: 500, message: "Error al listar participantes", detail: e };
  }
}

export async function getParticipantStats(): Promise<StoreResponse> {
  try {
    const [inscritos, confirmados, presentes, alojamiento] = await Promise.all([
      Participant.countDocuments({ estado: { $in: ACTIVE_REGISTRATION_STATES } }),
      Participant.countDocuments({
        estado: { $in: ["confirmado", "checkin_realizado", "checkout_realizado"] },
      }),
      Participant.countDocuments({ estado: "checkin_realizado" }),
      Participant.countDocuments({
        requiereAlojamiento: true,
        estado: { $in: ACTIVE_REGISTRATION_STATES },
      }),
    ]);

    return {
      status: 200,
      message: {
        inscritos,
        capacidadMaxima: CAPACITY_MAX,
        confirmados,
        presentes,
        alojamiento,
        plazasAlojamiento: LODGING_SLOTS,
      },
    };
  } catch (e) {
    return { status: 500, message: "Error al obtener estadísticas", detail: e };
  }
}

export async function findByToken(publicToken: string): Promise<StoreResponse> {
  try {
    const found = await Participant.findOne({ publicToken }).lean();
    if (!found) {
      return { status: 404, message: "Credencial no encontrada" };
    }
    if (!BADGE_STATES.includes(found.estado)) {
      return { status: 403, message: "La credencial aún no está confirmada" };
    }
    return { status: 200, message: toBadgeParticipant(found) };
  } catch (e) {
    return { status: 500, message: "Error al buscar credencial", detail: e };
  }
}

export async function findByDocument(
  documentoId: string,
  opts?: { publicLookup?: boolean }
): Promise<StoreResponse> {
  try {
    const normalized = normalizeDocumentoId(documentoId);
    if (!normalized) {
      return { status: 400, message: "Documento requerido" };
    }
    const found = await Participant.findOne({ documentoId: normalized }).lean();
    if (!found) {
      return { status: 404, message: "Participante no encontrado" };
    }
    if (opts?.publicLookup) {
      if (!BADGE_STATES.includes(found.estado)) {
        return { status: 403, message: "Tu acreditación aún no está confirmada" };
      }
      return { status: 200, message: toBadgeParticipant(found) };
    }
    return { status: 200, message: toPublicParticipant(found) };
  } catch (e) {
    return { status: 500, message: "Error al buscar participante", detail: e };
  }
}

export async function confirmPayment(
  id: string,
  actorId: string,
  referenciaComprobante?: string
): Promise<StoreResponse> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { status: 400, message: "ID inválido" };
    }
    const found = await Participant.findById(id);
    if (!found) {
      return { status: 404, message: "Participante no encontrado" };
    }
    if (found.estado !== "registrado") {
      return {
        status: 409,
        message: `No se puede confirmar un participante en estado ${found.estado}`,
      };
    }

    found.estado = "confirmado";
    found.pagoValidado = {
      validado: true,
      validadoPor: new mongoose.Types.ObjectId(actorId),
      fechaValidacion: new Date(),
      referenciaComprobante: referenciaComprobante?.trim() || undefined,
    };
    await found.save();
    return { status: 200, message: toPublicParticipant(found) };
  } catch (e) {
    return { status: 500, message: "Error al confirmar el pago", detail: e };
  }
}

export async function markQrEmailSent(id: string, sent: boolean): Promise<void> {
  await Participant.updateOne(
    { _id: id },
    { $set: { "comunicaciones.qrEnviadoEmail": sent } }
  );
}

export async function fixTypo(id: string, data: any): Promise<StoreResponse> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { status: 400, message: "ID inválido" };
    }
    const found = await Participant.findById(id);
    if (!found) {
      return { status: 404, message: "Participante no encontrado" };
    }

    for (const field of TYPO_FIELDS) {
      if (data[field] !== undefined && String(data[field]).trim() !== "") {
        if (field === "email") {
          const email = sanitizeEmailInput(data[field]);
          if (!email) {
            return { status: 400, message: "Correo electrónico no válido" };
          }
          found.email = email;
        } else {
          (found as any)[field] = String(data[field]).trim();
        }
      }
    }
    await found.save();
    return { status: 200, message: toPublicParticipant(found) };
  } catch (e: any) {
    if (e?.code === 11000) {
      return { status: 400, message: "Ese correo ya está en uso", detail: e };
    }
    return { status: 500, message: "Error al corregir datos", detail: e };
  }
}

export async function updateStatus(
  id: string,
  estado: string
): Promise<StoreResponse> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { status: 400, message: "ID inválido" };
    }
    if (estado !== "cancelado" && estado !== "no_asistira") {
      return { status: 400, message: "Solo se puede pasar a cancelado o no_asistira" };
    }
    const found = await Participant.findById(id);
    if (!found) {
      return { status: 404, message: "Participante no encontrado" };
    }
    if (found.estado !== "registrado") {
      return {
        status: 409,
        message: "Solo se puede cancelar un registro pendiente de confirmación",
      };
    }
    found.estado = estado as ParticipantState;
    await found.save();
    return { status: 200, message: toPublicParticipant(found) };
  } catch (e) {
    return { status: 500, message: "Error al actualizar estado", detail: e };
  }
}

export async function updateLodging(
  id: string,
  habitacionAsignada: string | null
): Promise<StoreResponse> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { status: 400, message: "ID inválido" };
    }
    const found = await Participant.findById(id);
    if (!found) {
      return { status: 404, message: "Participante no encontrado" };
    }
    found.habitacionAsignada = habitacionAsignada;
    await found.save();
    return { status: 200, message: toPublicParticipant(found) };
  } catch (e) {
    return { status: 500, message: "Error al asignar habitación", detail: e };
  }
}
