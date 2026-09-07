import { Schema, model, Types } from "mongoose";
import { SCAN_ACTIONS, type ScanAction } from "../../config/event";

export interface IScanLog {
  participantId: Types.ObjectId;
  operadorId: Types.ObjectId;
  tipoAccion: ScanAction;
  fechaScan: Date;
  observaciones?: string;
}

const scanLogSchema = new Schema<IScanLog>({
  participantId: {
    type: Schema.Types.ObjectId,
    ref: "Participant",
    required: true,
    index: true,
  },
  operadorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tipoAccion: { type: String, enum: SCAN_ACTIONS, required: true },
  fechaScan: { type: Date, default: Date.now },
  observaciones: String,
});

export const ScanLog = model<IScanLog>("ScanLog", scanLogSchema);
