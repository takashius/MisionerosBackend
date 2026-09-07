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

export interface IParticipant {
  publicToken: string;
  nombres: string;
  apellidos: string;
  documentoId: string;
  fechaNacimiento: Date;
  sexo: Sexo;
  whatsapp: string;
  email: string;
  ciudad: string;
  organizacionComunidad: string;
  tipo: ParticipantType;
  estado: ParticipantState;
  requiereAlojamiento: boolean;
  habitacionAsignada?: string | null;
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
    fechaNacimiento: { type: Date, required: true },
    sexo: { type: String, enum: SEXOS, required: true },
    whatsapp: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    organizacionComunidad: { type: String, required: true, trim: true },
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
