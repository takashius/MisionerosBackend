import { Schema, model } from "mongoose";

export const SCHEDULE_TYPES = [
  "comida",
  "liturgia",
  "formacion",
  "dinamica",
  "mesa",
  "panel",
  "recreo",
  "otro",
] as const;

export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

export interface IScheduleItem {
  fecha: string;
  horaInicio: string;
  horaFin?: string | null;
  titulo: string;
  tipo: ScheduleType;
  ponente?: string | null;
  moderador?: string | null;
  descripcion?: string | null;
  notasLogistica?: string | null;
  notasCampaneros?: string | null;
  fichaGuion?: string | null;
  orden: number;
  publicado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const scheduleSchema = new Schema<IScheduleItem>(
  {
    fecha: { type: String, required: true, index: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, default: null },
    titulo: { type: String, required: true, trim: true },
    tipo: { type: String, enum: SCHEDULE_TYPES, default: "otro" },
    ponente: { type: String, default: null, trim: true },
    moderador: { type: String, default: null, trim: true },
    descripcion: { type: String, default: null, trim: true },
    notasLogistica: { type: String, default: null, trim: true },
    notasCampaneros: { type: String, default: null, trim: true },
    fichaGuion: { type: String, default: null, trim: true },
    orden: { type: Number, default: 0 },
    publicado: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

scheduleSchema.index({ fecha: 1, horaInicio: 1, orden: 1 });

export const ScheduleItem = model<IScheduleItem>("ScheduleItem", scheduleSchema);
