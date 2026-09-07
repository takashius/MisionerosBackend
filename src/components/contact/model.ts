import { Schema, model } from "mongoose";

export interface IContactMessage {
  nombre: string;
  email: string;
  telefono?: string | null;
  asunto: string;
  mensaje: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const contactSchema = new Schema<IContactMessage>(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    telefono: { type: String, default: null, trim: true },
    asunto: { type: String, required: true, trim: true },
    mensaje: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const ContactMessage = model<IContactMessage>("ContactMessage", contactSchema);
