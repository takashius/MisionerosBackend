import userPaths, { definitions as userDefinitions } from "./user";

const definition = {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "Misioneros",
    description: "API for Misioneros App",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host: "localhost:3040",
  basePath: "/",
  servers: [
    {
      url: "localhost:3040",
      description: "Local server",
    },
  ],
  tags: [
    {
      name: "Users",
      description: "Autenticación y gestión de usuarios",
    },
  ],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Bearer {token}",
    },
  },
  paths: {
    ...userPaths,
  },
  definitions: {
    ...userDefinitions,
  },
};

export default definition;
