import { Client, SendEmailV3_1, LibraryResponse } from "node-mailjet";
import config from "../config/commons";
import mails from "./mails/index";

const mailjet = new Client({
  apiKey: process.env.MJ_APIKEY_PUBLIC || "your-api-key",
  apiSecret: process.env.MJ_APIKEY_PRIVATE || "your-api-secret",
});

export async function mailer(
  mailConfig: any,
  email: string,
  name: string,
  subject: string,
  title: string,
  message: string,
  type: number = 1,
  cotiza: any = null,
  cc?: Array<{ email: string; name?: string }>
) {
  try {
    let body = "";
    switch (type) {
      case 1:
        break;
      case 2:
        body = mails.MailDefault(title, message, mailConfig, name, cotiza);
        break;
    }

    const messagePayload: SendEmailV3_1.Message = {
      From: {
        Email: config.mailer.fromEmail,
        Name: config.mailer.fromName,
      },
      To: [
        {
          Email: email,
          Name: name,
        },
      ],
      Subject: subject,
      TextPart: message,
      HTMLPart: body,
      CustomID: "c41.Su-J3-41-M4",
    };

    if (cc?.length) {
      messagePayload.Cc = cc.map((entry) => ({
        Email: entry.email,
        Name: entry.name || entry.email,
      }));
    }

    const data: SendEmailV3_1.Body = {
      Messages: [messagePayload],
    };
    const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
      .post("send", { version: "v3.1" })
      .request(data);
    const messageResult = result.body.Messages?.[0];
    const status = messageResult?.Status;
    if (status !== "success") {
      console.log(
        "[WARN] -> mailer respuesta no exitosa",
        JSON.stringify({
          to: email,
          status: status || null,
          errors: messageResult?.Errors || null,
        })
      );
    }
    return status;
  } catch (e) {
    console.log("[ERROR] -> mailer envío fallido", { to: email, error: e });
  }
}
