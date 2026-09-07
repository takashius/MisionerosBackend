const account = {
  get: {
    tags: ["Users"],
    summary: "Obtener perfil del usuario autenticado",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { $ref: "#/definitions/ResponseUserData" },
      },
    },
  },
};

const updateRoles = {
  patch: {
    tags: ["Users"],
    summary: "Actualizar rol de un usuario",
    description:
      "SUPER_ADMIN y ADMIN. Body: `{ userId, role }` con uno de SUPER_ADMIN, ADMIN, MISIONERO, PARTICIPANTE. ADMIN no puede asignar SUPER_ADMIN.",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "body",
        in: "body",
        required: true,
        schema: {
          type: "object",
          required: ["userId", "role"],
          properties: {
            userId: { type: "string" },
            role: {
              type: "string",
              enum: ["SUPER_ADMIN", "ADMIN", "MISIONERO", "PARTICIPANTE"],
            },
          },
        },
      },
    ],
    responses: {
      200: { description: "Rol actualizado" },
      400: { description: "Rol inválido" },
      403: { description: "Sin permiso para asignar ese rol" },
    },
  },
};

const login = {
  post: {
    tags: ["Users"],
    summary: "Login con email y contraseña",
    description:
      "Retorna token JWT (24h) y `role` como array. `isFirstLogin` es true mientras `hasLoggedInBefore` sea false (hasta PATCH /user/profile con password).",
    parameters: [
      {
        name: "body",
        in: "body",
        required: true,
        schema: {
          type: "object",
          properties: {
            email: { type: "string", example: "usuario@ejemplo.com" },
            password: { type: "string", example: "password123" },
          },
          required: ["email", "password"],
        },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { $ref: "#/definitions/ResponseUserLoginData" },
      },
      401: { description: "Credenciales inválidas" },
    },
  },
};

const logout = {
  post: {
    tags: ["Users"],
    summary: "Cerrar sesión",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: { description: "OK", schema: { type: "string" } },
    },
  },
};

const create = {
  post: {
    tags: ["Users"],
    summary: "Crear usuario (ADMIN / SUPER_ADMIN)",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "body",
        in: "body",
        required: true,
        schema: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            lastName: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            role: {
              type: "string",
              enum: ["SUPER_ADMIN", "ADMIN", "MISIONERO", "PARTICIPANTE"],
              description: "Por defecto PARTICIPANTE",
            },
          },
        },
      },
    ],
    responses: {
      201: { description: "Creado", schema: { $ref: "#/definitions/User" } },
    },
  },
};

const update = {
  patch: {
    tags: ["Users"],
    summary: "Actualizar usuario (ADMIN / SUPER_ADMIN)",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "body",
        in: "body",
        required: true,
        schema: {
          type: "object",
          required: ["_id"],
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            lastName: { type: "string" },
            phone: { type: "string" },
            role: {
              type: "string",
              enum: ["SUPER_ADMIN", "ADMIN", "MISIONERO", "PARTICIPANTE"],
            },
          },
        },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { $ref: "#/definitions/ResponseUserData" },
      },
    },
  },
};

const updateProfile = {
  patch: {
    tags: ["Users"],
    summary: "Actualizar perfil (usuario autenticado)",
    description:
      "Mientras `hasLoggedInBefore` sea false puede enviar `email`. Al enviar `password` se marca hasLoggedInBefore=true. Foto: multipart campo `photo` o `image`.",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "body",
        in: "body",
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            lastName: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            bio: { type: "string" },
            address: { type: "string" },
          },
        },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { $ref: "#/definitions/ResponseUserData" },
      },
    },
  },
};

const upload = {
  post: {
    tags: ["Users"],
    summary: "Subir imagen",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "image",
        in: "formData",
        type: "file",
        required: true,
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { $ref: "#/definitions/ResponseCloudinary" },
      },
    },
  },
};

const recoveryPass1 = {
  get: {
    tags: ["Users"],
    summary: "Recuperar contraseña paso 1",
    parameters: [
      {
        name: "email",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: { description: "OK", schema: { type: "string" } },
    },
  },
};

const recoveryPass2 = {
  post: {
    tags: ["Users"],
    summary: "Recuperar contraseña paso 2",
    parameters: [
      {
        name: "body",
        in: "body",
        required: true,
        schema: {
          type: "object",
          properties: {
            email: { type: "string" },
            code: { type: "string" },
            newPass: { type: "string" },
          },
        },
      },
    ],
    responses: {
      200: { description: "OK", schema: { type: "string" } },
    },
  },
};

const list = {
  get: {
    tags: ["Users"],
    summary: "Listar usuarios paginados",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "page",
        in: "path",
        required: false,
        type: "integer",
      },
      {
        name: "pattern",
        in: "path",
        required: false,
        type: "string",
      },
    ],
    responses: {
      200: { description: "OK", schema: { $ref: "#/definitions/Users" } },
    },
  },
};

const userByID = {
  get: {
    tags: ["Users"],
    summary: "Obtener usuario por ID",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { $ref: "#/definitions/ResponseUserData" },
      },
    },
  },
};

const changePassword = {
  post: {
    tags: ["Users"],
    summary: "Cambiar contraseña del usuario autenticado",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "body",
        in: "body",
        schema: {
          type: "object",
          properties: { password: { type: "string" } },
        },
      },
    ],
    responses: {
      200: { description: "OK" },
    },
  },
};

const deleteUser = {
  delete: {
    tags: ["Users"],
    summary: "Desactivar usuario (soft delete)",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
      },
    ],
    responses: {
      200: { description: "OK" },
      403: { description: "No se puede eliminar SUPER_ADMIN" },
    },
  },
};

const definitions = {
  User: {
    required: ["_id", "name", "email"],
    properties: {
      _id: { type: "string" },
      name: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string", format: "email" },
      photo: { type: "string" },
      phone: { type: "string" },
      date: { type: "string", format: "date" },
      role: {
        type: "string",
        enum: ["SUPER_ADMIN", "ADMIN", "MISIONERO", "PARTICIPANTE"],
      },
    },
  },
  Users: {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: { $ref: "#/definitions/User" },
      },
      totalUSers: { type: "number" },
      totalPages: { type: "number" },
      currentPage: { type: "number" },
      next: { type: "number" },
    },
  },
  ResponseUserData: {
    properties: {
      _id: { type: "string" },
      name: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string", format: "email" },
      date: { type: "string", format: "date" },
      phone: { type: "string" },
      photo: { type: "string" },
      banner: { type: "string" },
      bio: { type: "string" },
      address: { type: "string" },
      role: {
        type: "array",
        items: { type: "string" },
      },
      active: { type: "boolean" },
    },
  },
  ResponseUserLoginData: {
    properties: {
      _id: { type: "string" },
      name: { type: "string" },
      lastName: { type: "string" },
      photo: { type: "string" },
      email: { type: "string", format: "email" },
      date: { type: "string", format: "date" },
      role: {
        type: "array",
        items: { type: "string" },
      },
      isFirstLogin: { type: "boolean" },
      token: { type: "string" },
    },
  },
  ResponseCloudinary: {
    properties: {
      fieldname: { type: "string" },
      originalname: { type: "string" },
      encoding: { type: "string" },
      mimetype: { type: "string" },
      path: { type: "string" },
      size: { type: "string" },
      filename: { type: "string" },
    },
  },
};

const paths = {
  "/user": {
    post: create.post,
    patch: update.patch,
  },
  "/user/profile": {
    patch: updateProfile.patch,
  },
  "/user/simple": {
    get: list.get,
  },
  "/user/roles": {
    get: {
      tags: ["Users"],
      summary: "Listar roles disponibles",
      parameters: [
        {
          name: "Authorization",
          in: "header",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "OK" },
      },
    },
  },
  "/user/list/{page}/{pattern}": {
    get: list.get,
  },
  "/user/list/{page}": {
    get: list.get,
  },
  "/user/list": {
    get: list.get,
  },
  "/user/account": {
    get: account.get,
  },
  "/user/{id}": {
    get: userByID.get,
    delete: deleteUser.delete,
  },
  "/user/login": {
    post: login.post,
  },
  "/user/logout": {
    post: logout.post,
  },
  "/user/logoutall": {
    post: logout.post,
  },
  "/user/change_password": {
    post: changePassword.post,
  },
  "/user/recovery/{email}": {
    get: recoveryPass1.get,
  },
  "/user/recovery": {
    post: recoveryPass2.post,
  },
  "/user/upload": {
    post: upload.post,
  },
  "/user/uploadBanner": {
    post: upload.post,
  },
  "/user/uploadUserImage": {
    post: upload.post,
  },
  "/user/updateRoles": {
    patch: updateRoles.patch,
  },
};

export { definitions, paths };
export default paths;
