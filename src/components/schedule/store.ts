import mongoose from "mongoose";
import { ScheduleItem, SCHEDULE_TYPES, type ScheduleType } from "./model";
import { OFFICIAL_SCHEDULE } from "./seedData";
import { StoreResponse } from "../../types/general";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toPublicItem(item: any) {
  return {
    _id: item._id,
    fecha: item.fecha,
    horaInicio: item.horaInicio,
    horaFin: item.horaFin ?? null,
    titulo: item.titulo,
    tipo: item.tipo,
    ponente: item.ponente ?? null,
    moderador: item.moderador ?? null,
    descripcion: item.descripcion ?? null,
    orden: item.orden,
  };
}

export function toStaffItem(item: any) {
  return {
    ...toPublicItem(item),
    notasLogistica: item.notasLogistica ?? null,
    notasCampaneros: item.notasCampaneros ?? null,
    fichaGuion: item.fichaGuion ?? null,
    publicado: item.publicado,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function isScheduleType(value: unknown): value is ScheduleType {
  return typeof value === "string" && SCHEDULE_TYPES.includes(value as ScheduleType);
}

function normalizeTime(value: string) {
  const trimmed = value.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(trimmed)) {
    return trimmed.slice(0, 5);
  }
  return trimmed;
}

function normalizePayload(data: any) {
  const fecha = String(data.fecha || "").trim();
  const horaInicio = normalizeTime(String(data.horaInicio || ""));
  const titulo = String(data.titulo || "").trim();
  if (!DATE_RE.test(fecha)) {
    return { error: "La fecha debe tener formato YYYY-MM-DD" };
  }
  if (!TIME_RE.test(horaInicio)) {
    return { error: "La hora de inicio debe tener formato HH:mm" };
  }
  if (!titulo) {
    return { error: "El título es obligatorio" };
  }
  const horaFin = data.horaFin ? normalizeTime(String(data.horaFin)) : null;
  if (horaFin && !TIME_RE.test(horaFin)) {
    return { error: "La hora de fin debe tener formato HH:mm" };
  }
  return {
    value: {
      fecha,
      horaInicio,
      horaFin,
      titulo,
      tipo: isScheduleType(data.tipo) ? data.tipo : "otro",
      ponente: data.ponente ? String(data.ponente).trim() : null,
      moderador: data.moderador ? String(data.moderador).trim() : null,
      descripcion: data.descripcion ? String(data.descripcion).trim() : null,
      notasLogistica: data.notasLogistica ? String(data.notasLogistica).trim() : null,
      notasCampaneros: data.notasCampaneros ? String(data.notasCampaneros).trim() : null,
      fichaGuion: data.fichaGuion ? String(data.fichaGuion).trim() : null,
      orden: Number.isFinite(Number(data.orden)) ? Number(data.orden) : 0,
      publicado: data.publicado !== false,
    },
  };
}

export async function listPublic(fecha?: string): Promise<StoreResponse> {
  try {
    const query: Record<string, unknown> = { publicado: true };
    if (fecha && DATE_RE.test(fecha)) {
      query.fecha = fecha;
    }
    const results = await ScheduleItem.find(query).sort({ fecha: 1, horaInicio: 1, orden: 1 }).lean();
    return { status: 200, message: results.map(toPublicItem) };
  } catch (e) {
    return { status: 500, message: "Error al listar el cronograma", detail: e };
  }
}

export async function listManage(fecha?: string): Promise<StoreResponse> {
  try {
    const query: Record<string, unknown> = {};
    if (fecha && DATE_RE.test(fecha)) {
      query.fecha = fecha;
    }
    const results = await ScheduleItem.find(query).sort({ fecha: 1, horaInicio: 1, orden: 1 }).lean();
    return { status: 200, message: results.map(toStaffItem) };
  } catch (e) {
    return { status: 500, message: "Error al listar el cronograma", detail: e };
  }
}

export async function createItem(data: any): Promise<StoreResponse> {
  try {
    const parsed = normalizePayload(data);
    if ("error" in parsed) {
      return { status: 400, message: parsed.error };
    }
    const created = await ScheduleItem.create(parsed.value);
    return { status: 201, message: toStaffItem(created) };
  } catch (e) {
    return { status: 500, message: "Error al crear el bloque", detail: e };
  }
}

export async function updateItem(id: string, data: any): Promise<StoreResponse> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { status: 400, message: "ID inválido" };
    }
    const found = await ScheduleItem.findById(id);
    if (!found) {
      return { status: 404, message: "Bloque no encontrado" };
    }
    const parsed = normalizePayload({ ...found.toObject(), ...data });
    if ("error" in parsed) {
      return { status: 400, message: parsed.error };
    }
    Object.assign(found, parsed.value);
    await found.save();
    return { status: 200, message: toStaffItem(found) };
  } catch (e) {
    return { status: 500, message: "Error al actualizar el bloque", detail: e };
  }
}

export async function deleteItem(id: string): Promise<StoreResponse> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { status: 400, message: "ID inválido" };
    }
    const found = await ScheduleItem.findByIdAndDelete(id);
    if (!found) {
      return { status: 404, message: "Bloque no encontrado" };
    }
    return { status: 200, message: { deleted: true, _id: id } };
  } catch (e) {
    return { status: 500, message: "Error al eliminar el bloque", detail: e };
  }
}

export async function seedOfficialSchedule(): Promise<void> {
  const count = await ScheduleItem.countDocuments();
  if (count > 0) {
    return;
  }
  await ScheduleItem.insertMany(OFFICIAL_SCHEDULE.map((item) => ({ ...item, publicado: true })));
  console.log(`[seed] Cronograma oficial cargado (${OFFICIAL_SCHEDULE.length} bloques)`);
}
