import * as dotenv from "dotenv";

const nodeEnv = process.env.NODE_ENV || "development";
const isDeployedEnv = nodeEnv === "production" || nodeEnv === "staging";

if (nodeEnv !== "production") {
  dotenv.config();
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(
      `[config] ${name} es obligatorio cuando NODE_ENV=${nodeEnv}`
    );
  }
  return value.trim();
}

const jwtKeyFromEnv = process.env.JWT_KEY?.trim();
if (isDeployedEnv) {
  requireEnv("JWT_KEY", jwtKeyFromEnv);
}

const monDebug = process.env.MONGO_DEBUG === "true" || false;
const dbUrl: string = process.env.BD_URL as string;
const dbAtlasUrl: string = process.env.BD_ATLAS_URL as string;

const config = {
  nodeEnv,
  isDeployedEnv,
  dbUrl,
  dbAtlasUrl,
  monDebug,
  port: process.env.PORT || 8080,
  host: process.env.HOST || "http://localhost",
  JWT_KEY: isDeployedEnv
    ? (jwtKeyFromEnv as string)
    : jwtKeyFromEnv || "dev-only-jwt-key-not-for-production",
  publicRoute: process.env.PUBLIC_ROUTE || "/public",
  staticRoute: process.env.PUBLIC_ROUTE || "/static",
  filesRoute: process.env.FILES_ROUTE || "/files",
  dev: nodeEnv === "development" || nodeEnv === "test",
  publicAppUrl: process.env.PUBLIC_APP_URL || "http://localhost:3050",
  userAdminEmail: process.env.USER_ADMIN_EMAIL,
  userAdminPassword: process.env.USER_ADMIN_PASSWORD,
  userAdminName: process.env.USER_ADMIN_NAME || "Administrador",
  mailer: {
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
    secure: process.env.MAILER_SECURE || false,
    fromEmail: process.env.MAIL_FROM_EMAIL || "envios@edugestion.site",
    fromName: process.env.MAIL_FROM_NAME || "Misioneros",
  },
  cloudinary: {
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
    FOLDER_NAME: process.env.FOLDER_NAME,
  },
};

export default config;
