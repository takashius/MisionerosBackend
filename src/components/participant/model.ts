import { Schema, model, Types } from "mongoose";
import {
  PARTICIPANT_STATES,
  PARTICIPANT_TYPES,
  SEXOS,
  type ParticipantState,
  type ParticipantType,
  type Sexo,
} from "../../config/event";

export interface IPagoValidado {
  validado: boolean;
  validadoPor?: Types.ObjectId;
  fechaValidacion?: Date;
  referenciaComprobante?: string;
}

export interface IPagoInscripcion {
  titular?: string;
  banco?: string;
  fecha?: Date;
  referencia?: string;
  monto?: string;
  tasaBcv?: string;
  comprobanteUrl?: string;
}

export interface IParticipant {
  publicToken: string;
  nombres: string;
  apellidos: string;
  documentoId: string;
  fechaNacimiento?: Date;
  edad?: number;
  sexo?: Sexo;
  whatsapp?: string;
  email: string;
  ciudad?: string;
  arquidiocesis?: string;
  organizacionComunidad?: string;
  redesSociales?: string;
  tipo: ParticipantType;
  estado: ParticipantState;
  requiereAlojamiento: boolean;
  habitacionAsignada?: string | null;
  tieneAlergiaEnfermedad?: boolean;
  alergiasEnfermedadDetalle?: string;
  estadoVida?: string;
  telefonoEmergencia?: string;
  pagoInscripcion?: IPagoInscripcion;
  pagoValidado: IPagoValidado;
  comunicaciones: {
    qrEnviadoEmail: boolean;
    qrEnviadoWhatsApp: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const participantSchema = new Schema<IParticipant>(
  {
    publicToken: { type: String, required: true, unique: true, index: true },
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, required: true, trim: true },
    documentoId: { type: String, required: true, unique: true, trim: true, index: true },
    fechaNacimiento: { type: Date },
    edad: { type: Number, min: 1, max: 120 },
    sexo: { type: String, enum: SEXOS },
    whatsapp: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ciudad: { type: String, trim: true },
    arquidiocesis: { type: String, trim: true },
    organizacionComunidad: { type: String, trim: true },
    redesSociales: { type: String, trim: true },
    tipo: {
      type: String,
      enum: PARTICIPANT_TYPES,
      default: "misionero",
    },
    estado: {
      type: String,
      enum: PARTICIPANT_STATES,
      default: "registrado",
      index: true,
    },
    requiereAlojamiento: { type: Boolean, default: true },
    habitacionAsignada: { type: String, default: null },
    tieneAlergiaEnfermedad: { type: Boolean },
    alergiasEnfermedadDetalle: { type: String, trim: true },
    estadoVida: { type: String, trim: true },
    telefonoEmergencia: { type: String, trim: true },
    pagoInscripcion: {
      titular: { type: String, trim: true },
      banco: { type: String, trim: true },
      fecha: Date,
      referencia: { type: String, trim: true },
      monto: { type: String, trim: true },
      tasaBcv: { type: String, trim: true },
      comprobanteUrl: { type: String, trim: true },
    },
    pagoValidado: {
      validado: { type: Boolean, default: false },
      validadoPor: { type: Schema.Types.ObjectId, ref: "User" },
      fechaValidacion: Date,
      referenciaComprobante: String,
    },
    comunicaciones: {
      qrEnviadoEmail: { type: Boolean, default: false },
      qrEnviadoWhatsApp: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Participant = model<IParticipant>("Participant", participantSchema);
