import { Participant } from "../participant/model";
import { ScanLog } from "./model";
import { StoreResponse } from "../../types/general";
import { toPublicParticipant } from "../participant/store";

export async function validateScan(options: {
  publicToken: string;
  accion: "checkin" | "checkout";
  operadorId: string;
}): Promise<StoreResponse> {
  try {
    const found = await Participant.findOne({ publicToken: options.publicToken });
    if (!found) {
      return { status: 404, message: "Credencial no válida" };
    }

    const previous = await ScanLog.findOne({
      participantId: found._id,
      tipoAccion: options.accion,
    }).sort({ fechaScan: 1 });

    if (options.accion === "checkin") {
      if (found.estado === "checkin_realizado" || found.estado === "checkout_realizado") {
        return {
          status: 409,
          message: "Este participante ya tiene check-in",
          detail: {
            code: "ALREADY_SCANNED",
            fecha: previous?.fechaScan || found.updatedAt,
            estado: found.estado,
          },
        };
      }
      if (found.estado !== "confirmado") {
        return {
          status: 409,
          message: `Check-in no permitido en estado ${found.estado}`,
        };
      }
      found.estado = "checkin_realizado";
    } else {
      if (found.estado === "checkout_realizado") {
        return {
          status: 409,
          message: "Este participante ya tiene check-out",
          detail: {
            code: "ALREADY_SCANNED",
            fecha: previous?.fechaScan || found.updatedAt,
            estado: found.estado,
          },
        };
      }
      if (found.estado !== "checkin_realizado") {
        return {
          status: 409,
          message: `Check-out no permitido en estado ${found.estado}`,
        };
      }
      found.estado = "checkout_realizado";
    }

    await found.save();
    const log = await ScanLog.create({
      participantId: found._id,
      operadorId: options.operadorId,
      tipoAccion: options.accion,
    });

    return {
      status: 200,
      message: {
        participant: toPublicParticipant(found),
        scan: {
          _id: log._id,
          tipoAccion: log.tipoAccion,
          fechaScan: log.fechaScan,
        },
      },
    };
  } catch (e) {
    return { status: 500, message: "Error al validar el escaneo", detail: e };
  }
}
