# Misioneros — Backend

API de la **I Asamblea de Misioneros Digitales** (Caracas 2026, sede CEV). Express + TypeScript + MongoDB + JWT.

No hay multi-tenant ni permisos por ruta. Un usuario tiene un solo rol: `SUPER_ADMIN`, `ADMIN`, `MISIONERO` o `PARTICIPANTE`.

## Requisitos

- Node.js 20+
- MongoDB local (por defecto `mongodb://localhost:27017/misioneros`)

## Arranque

```bash
cd backend
cp .env.example .env   # si aún no tienes .env
npm install
npm run dev
```

El API queda en `http://localhost:3040`. Swagger: `http://localhost:3040/api-docs`.

Al arrancar, si no existe ningún `SUPER_ADMIN`, se crea uno con `USER_ADMIN_EMAIL` y `USER_ADMIN_PASSWORD`.

## Variables de entorno

Copia `.env.example`. Lo mínimo para desarrollo:

| Variable | Uso |
|---|---|
| `BD_URL` | MongoDB |
| `PORT` | Puerto HTTP (`3040`) |
| `JWT_KEY` | Firma de tokens (24 h) |
| `CORS_ORIGINS` | Orígenes permitidos (`http://localhost:3050`) |
| `USER_ADMIN_EMAIL` | Correo del admin inicial |
| `USER_ADMIN_PASSWORD` | Contraseña del admin inicial |
| `USER_ADMIN_NAME` | Nombre del admin inicial |

Mailjet y Cloudinary son opcionales en local; ver `.env.example`.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga |
| `npm run build` | Compila a `dist/` |
| `npm start` | Corre el build |
| `npm run test:unit` | Tests unitarios |
| `npm run test:integration` | Tests de integración |
| `npm test` | Integración (config por defecto) |

## Autenticación

`POST /user/login` con `{ "email", "password" }` devuelve JWT y `role` como array.

El panel del frontend solo admite `SUPER_ADMIN` y `ADMIN`. El pase digital y el escáner no usan este login todavía.

Endpoints útiles:

- `POST /user/login`
- `POST /user/logout` (Bearer)
- `GET /user/recovery/:email` — pide código (no revela si el correo existe)
- `POST /user/recovery` — `{ email, code, newPass }`
- `GET /user/account` (Bearer)
- `GET /user/list/:page?/:pattern?` — listado (ADMIN / SUPER_ADMIN)
- `POST /user` — alta de usuario (ADMIN / SUPER_ADMIN)
- `PATCH /user` — editar datos/rol. **No cambia la contraseña**
- `POST /user/change_password/:userId` — cambio de clave por un admin
- `GET /active-response` — ping

## Roles

- **SUPER_ADMIN**: todo, incluido asignar `SUPER_ADMIN`.
- **ADMIN**: usuarios, excepto crear/editar/borrar `SUPER_ADMIN`.
- **MISIONERO / PARTICIPANTE**: solo su cuenta.

## Estructura

```
src/
  config/          # DB, CORS, roles, rutas
  components/user/ # modelo, store, controller, network
  middleware/      # auth JWT, seed, rate limit, mail, storage
  documentation/   # Swagger
  utils/
```
