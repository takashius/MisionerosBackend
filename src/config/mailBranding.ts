/**
 * Branding de correos con la misma forma que `company` en EduGestion
 * (`logo`, `banner`, `phone`, `email`, `configMail.colors`).
 */
export function getMailBranding() {
  const primary = process.env.MAIL_COLOR_PRIMARY || "#008080";
  const secondary = process.env.MAIL_COLOR_SECONDARY || "#8CF7FC";

  return {
    name: process.env.MAIL_BRAND_NAME || "Misioneros",
    email: process.env.MAIL_BRAND_EMAIL || process.env.MAIL_FROM_EMAIL || "",
    phone: process.env.MAIL_BRAND_PHONE || "",
    logo: process.env.MAIL_BRAND_LOGO || "",
    banner: process.env.MAIL_BRAND_BANNER || "",
    configMail: {
      colors: {
        primary,
        secondary,
        secundary: secondary,
        background: process.env.MAIL_COLOR_BACKGROUND || "#2a2a2a",
        title: process.env.MAIL_COLOR_TITLE || "#ffffff",
      },
    },
  };
}
