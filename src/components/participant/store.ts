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
  isSexo,
  normalizeDocumentoId,
  type ParticipantState,
  type ParticipantType,
} from "../../config/event";
import type { IPagoInscripcion } from "./model";

function optionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
}

function optionalDate(value: unknown): Date | undefined | "invalid" {
  if (value == null || String(value).trim() === "") return undefined;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return "invalid";
  return parsed;
}

function optionalAge(value: unknown): number | undefined | "invalid" {
  if (value == null || String(value).trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 120) return "invalid";
  return parsed;
}

function optionalBool(value: unknown): boolean | undefined {
  if (value === true || value === false) return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["si", "sí", "true", "1"].includes(normalized)) return true;
  if (["no", "false", "0"].includes(normalized)) return false;
  return undefined;
}

function buildPagoInscripcion(data: any): IPagoInscripcion | undefined | "invalid" {
  const src =
    data?.pagoInscripcion && typeof data.pagoInscripcion === "object" ? data.pagoInscripcion : data;
  const fecha = optionalDate(src.fecha ?? src.pagoFecha);
  if (fecha === "invalid") return "invalid";
  const pago: IPagoInscripcion = {
    titular: optionalString(src.titular ?? src.pagoTitular),
    banco: optionalString(src.banco ?? src.pagoBanco),
    fecha,
    referencia: optionalString(src.referencia ?? src.pagoReferencia),
    monto: optionalString(src.monto ?? src.pagoMonto),
    tasaBcv: optionalString(src.tasaBcv ?? src.pagoTasaBcv),
    comprobanteUrl: optionalString(src.comprobanteUrl),
  };
  if (
    !pago.titular &&
    !pago.banco &&
    !pago.fecha &&
    !pago.referencia &&
    !pago.monto &&
    !pago.tasaBcv &&
    !pago.comprobanteUrl
  ) {
    return undefined;
  }
  return pago;
}

export function toPublicParticipant(item: any) {
  return {
    _id: item._id,
    publicToken: item.publicToken,
    nombres: item.nombres,
    apellidos: item.apellidos,
    documentoId: item.documentoId,
    fechaNacimiento: item.fechaNacimiento,
    edad: item.edad,
    sexo: item.sexo,
    whatsapp: item.whatsapp,
    email: item.email,
    ciudad: item.ciudad,
    arquidiocesis: item.arquidiocesis,
    organizacionComunidad: item.organizacionComunidad,
    redesSociales: item.redesSociales,
    tipo: item.tipo,
    estado: item.estado,
    requiereAlojamiento: item.requiereAlojamiento,
    habitacionAsignada: item.habitacionAsignada ?? null,
    tieneAlergiaEnfermedad: item.tieneAlergiaEnfermedad,
    alergiasEnfermedadDetalle: item.alergiasEnfermedadDetalle,
    estadoVida: item.estadoVida,
    telefonoEmergencia: item.telefonoEmergencia,
    pagoInscripcion: item.pagoInscripcion,
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

    const nombres = optionalString(data.nombres);
    const apellidos = optionalString(data.apellidos);
    if (!nombres) {
      return { status: 400, message: "El campo nombres es obligatorio" };
    }
    if (!apellidos) {
      return { status: 400, message: "El campo apellidos es obligatorio" };
    }

    const fechaNacimiento = optionalDate(data.fechaNacimiento);
    if (fechaNacimiento === "invalid") {
      return { status: 400, message: "Fecha de nacimiento inválida" };
    }

    const edad = optionalAge(data.edad);
    if (edad === "invalid") {
      return { status: 400, message: "Edad inválida" };
    }

    const sexoRaw = optionalString(data.sexo);
    if (sexoRaw && !isSexo(sexoRaw)) {
      return { status: 400, message: "Sexo inválido" };
    }
    const sexo = sexoRaw && isSexo(sexoRaw) ? sexoRaw : undefined;

    const pagoInscripcion = buildPagoInscripcion(data);
    if (pagoInscripcion === "invalid") {
      return { status: 400, message: "Fecha de pago inválida" };
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

    const whatsapp = optionalString(data.whatsapp);
    const ciudad = optionalString(data.ciudad);
    const arquidiocesis = optionalString(data.arquidiocesis);
    const organizacionComunidad = optionalString(data.organizacionComunidad);
    const redesSociales = optionalString(data.redesSociales);
    const tieneAlergiaEnfermedad = optionalBool(data.tieneAlergiaEnfermedad);
    const alergiasEnfermedadDetalle = optionalString(data.alergiasEnfermedadDetalle);
    const estadoVida = optionalString(data.estadoVida);
    const telefonoEmergencia = optionalString(data.telefonoEmergencia);

    const created = await Participant.create({
      publicToken: randomUUID(),
      nombres,
      apellidos,
      documentoId,
      ...(fechaNacimiento ? { fechaNacimiento } : {}),
      ...(edad ? { edad } : {}),
      ...(sexo ? { sexo } : {}),
      ...(whatsapp ? { whatsapp } : {}),
      email,
      ...(ciudad ? { ciudad } : {}),
      ...(arquidiocesis ? { arquidiocesis } : {}),
      ...(organizacionComunidad ? { organizacionComunidad } : {}),
      ...(redesSociales ? { redesSociales } : {}),
      tipo,
      estado: "registrado",
      requiereAlojamiento: data.requiereAlojamiento !== false,
      ...(tieneAlergiaEnfermedad !== undefined ? { tieneAlergiaEnfermedad } : {}),
      ...(alergiasEnfermedadDetalle ? { alergiasEnfermedadDetalle } : {}),
      ...(estadoVida ? { estadoVida } : {}),
      ...(telefonoEmergencia ? { telefonoEmergencia } : {}),
      ...(pagoInscripcion ? { pagoInscripcion } : {}),
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
          "arquidiocesis",
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

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    const putRequired = (field: "nombres" | "apellidos", raw: unknown) => {
      if (raw === undefined) return null;
      const value = optionalString(raw);
      if (!value) return `El campo ${field} es obligatorio`;
      $set[field] = value;
      return null;
    };
    const nombresError = putRequired("nombres", data.nombres);
    if (nombresError) return { status: 400, message: nombresError };
    const apellidosError = putRequired("apellidos", data.apellidos);
    if (apellidosError) return { status: 400, message: apellidosError };

    if (data.email !== undefined) {
      const email = sanitizeEmailInput(data.email);
      if (!email) {
        return { status: 400, message: "Correo electrónico no válido" };
      }
      $set.email = email;
    }

    const putOptionalString = (field: string, raw: unknown) => {
      if (raw === undefined) return;
      const value = optionalString(raw);
      if (value) $set[field] = value;
      else $unset[field] = 1;
    };
    putOptionalString("whatsapp", data.whatsapp);
    putOptionalString("ciudad", data.ciudad);
    putOptionalString("arquidiocesis", data.arquidiocesis);
    putOptionalString("organizacionComunidad", data.organizacionComunidad);
    putOptionalString("redesSociales", data.redesSociales);
    putOptionalString("estadoVida", data.estadoVida);
    putOptionalString("telefonoEmergencia", data.telefonoEmergencia);
    putOptionalString("alergiasEnfermedadDetalle", data.alergiasEnfermedadDetalle);

    if (data.sexo !== undefined) {
      const sexoRaw = optionalString(data.sexo);
      if (!sexoRaw) $unset.sexo = 1;
      else if (!isSexo(sexoRaw)) return { status: 400, message: "Sexo inválido" };
      else $set.sexo = sexoRaw;
    }

    if (data.edad !== undefined) {
      const edad = optionalAge(data.edad);
      if (edad === "invalid") return { status: 400, message: "Edad inválida" };
      if (edad) $set.edad = edad;
      else $unset.edad = 1;
    }

    if (data.fechaNacimiento !== undefined) {
      const fechaNacimiento = optionalDate(data.fechaNacimiento);
      if (fechaNacimiento === "invalid") {
        return { status: 400, message: "Fecha de nacimiento inválida" };
      }
      if (fechaNacimiento) $set.fechaNacimiento = fechaNacimiento;
      else $unset.fechaNacimiento = 1;
    }

    if (data.tieneAlergiaEnfermedad !== undefined) {
      const value = optionalBool(data.tieneAlergiaEnfermedad);
      if (value === undefined) $unset.tieneAlergiaEnfermedad = 1;
      else $set.tieneAlergiaEnfermedad = value;
    }

    if (data.requiereAlojamiento !== undefined) {
      $set.requiereAlojamiento = data.requiereAlojamiento !== false;
    }

    if (data.pagoInscripcion !== undefined || data.pagoTitular !== undefined) {
      const src =
        data.pagoInscripcion && typeof data.pagoInscripcion === "object"
          ? { ...data.pagoInscripcion }
          : data;
      if (!optionalString(src.comprobanteUrl) && found.pagoInscripcion?.comprobanteUrl) {
        src.comprobanteUrl = found.pagoInscripcion.comprobanteUrl;
      }
      const pagoInscripcion = buildPagoInscripcion({ pagoInscripcion: src });
      if (pagoInscripcion === "invalid") {
        return { status: 400, message: "Fecha de pago inválida" };
      }
      if (pagoInscripcion) $set.pagoInscripcion = pagoInscripcion;
      else $unset.pagoInscripcion = 1;
    }

    delete $set.tipo;
    delete $set.documentoId;
    delete $set.publicToken;
    delete $unset.tipo;
    delete $unset.documentoId;
    delete $unset.publicToken;

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;
    if (Object.keys(update).length) {
      await Participant.updateOne({ _id: found._id }, update);
    }

    const updated = await Participant.findById(id);
    return { status: 200, message: toPublicParticipant(updated) };
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
