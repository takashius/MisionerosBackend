import serverless from "serverless-http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import db from "./config/db";
import config from "./config/commons";
import { assertCorsConfiguredForDeployedEnv, buildCorsOptions } from "./config/cors";
import routes from "./config/routes";
import definition from "./documentation/swagger";
import { serve, setup } from "swagger-ui-express";
import { seedAppData } from "./middleware/seed";

assertCorsConfiguredForDeployedEnv();

const server = express();

server.use(helmet());

server.use(
  bodyParser.json({
    limit: "1mb",
    type: (req) => {
      const contentType = String(req.headers["content-type"] || "");
      return /application\/json/i.test(contentType);
    },
  })
);

server.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "1mb",
    type: (req) => {
      const contentType = String(req.headers["content-type"] || "");
      return /application\/x-www-form-urlencoded/i.test(contentType);
    },
  })
);

const corsOptions = buildCorsOptions();

server.use(cors(corsOptions));
server.options("*", cors(corsOptions));

routes(server);

if (config.nodeEnv !== "production") {
  server.use(
    "/api-docs",
    serve,
    setup(definition, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        docExpansion: "none",
      },
    })
  );
}

server.get("/active-response", (req, res) => {
  const active = true;
  res.json({ active });
});

server.use(express.static(config.publicRoute));
server.use(express.static("./static"));

/** Errores de body-parser (JSON inválido / Content-Type incorrecto). */
server.use((err: any, _req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      message:
        "Cuerpo de la petición inválido. Si envías multipart/form-data, no uses Content-Type application/json.",
      detail: err.message,
    });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "No se pudo parsear el cuerpo de la petición.",
      detail: err.message,
    });
  }
  return next(err);
});

let serverInstance: any;

const init = async () => {
  if (process.env.NODE_ENV !== "test") {
    await db(config.dbUrl);
    await seedAppData();
  }
  if (process.env.NODE_ENV !== "test") {
    serverInstance = server.listen(config.port, () => {
      console.log(`Listening on http://localhost:${config.port}`);
    });
  }
};

if (process.env.NODE_ENV !== "test") {
  init();
}

export const handler = serverless(server);
export { server, serverInstance, init };
export default server;
