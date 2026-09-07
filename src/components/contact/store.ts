import validator from "validator";
import { ContactMessage } from "./model";
import { StoreResponse } from "../../types/general";
import { mailer } from "../../middleware/mailer";
import config from "../../config/commons";

function clean(value: unknown) {
  const trimmed = String(value || "").trim();
  return trimmed || null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function createMessage(data: any): Promise<StoreResponse> {
  try {
    const nombre = String(data.nombre || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const asunto = String(data.asunto || "").trim();
    const mensaje = String(data.mensaje || "").trim();
    const telefono = clean(data.telefono);

    if (!nombre) {
      return { status: 400, message: "El nombre es obligatorio" };
    }
    if (!validator.isEmail(email)) {
      return { status: 400, message: "El correo no es válido" };
    }
    if (!asunto) {
      return { status: 400, message: "El asunto es obligatorio" };
    }
    if (mensaje.length < 10) {
      return { status: 400, message: "El mensaje debe tener al menos 10 caracteres" };
    }

    const created = await ContactMessage.create({
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
    });

    const notifyTo = config.userAdminEmail?.trim();
    if (notifyTo) {
      const body = `
        <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
        <p><strong>Correo:</strong> ${escapeHtml(email)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(telefono || "—")}</p>
        <p><strong>Asunto:</strong> ${escapeHtml(asunto)}</p>
        <p>${escapeHtml(mensaje).replace(/\n/g, "<br />")}</p>
      `;
      void mailer(
        {},
        notifyTo,
        "Equipo CEV",
        `Contacto web: ${asunto}`,
        "Nuevo mensaje de contacto",
        body,
        2
      );
    }

    return {
      status: 201,
      message: {
        _id: created._id,
        received: true,
      },
    };
  } catch (e) {
    return { status: 500, message: "Error al enviar el mensaje", detail: e };
  }
}
