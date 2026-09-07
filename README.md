# Misioneros — Backend

API de la **I Asamblea de Misioneros Digitales** (Caracas 2026, sede CEV). Express + TypeScript + MongoDB + JWT.

No hay multi-tenant. Un usuario de login (staff o cuenta de sistema) tiene un solo rol.

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
| `PUBLIC_APP_URL` | URL del frontend para el enlace del pase en el correo |
| `USER_ADMIN_EMAIL` | Correo del admin inicial |
| `USER_ADMIN_PASSWORD` | Contraseña del admin inicial |
| `USER_ADMIN_NAME` | Nombre del admin inicial |

Mailjet y Cloudinary son opcionales en local; ver `.env.example`. WhatsApp / OpenWA no se integran.

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

Endpoints de usuarios:

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

## Participantes y acreditación

Aforo máximo **80**. Estados: `registrado` → `confirmado` → `checkin_realizado` → `checkout_realizado` (también `cancelado` / `no_asistira`).

- `POST /participant/register` — público
- `GET /participant` — staff, filtros `estado`, `tipo`, `search`, `page`
- `GET /participant/stats` — KPIs
- `GET /participant/by-token/:publicToken` — pase público
- `GET /participant/lookup/:documentoId` — consulta pública de credencial (solo si ya está confirmada)
- `GET /participant/by-document/:documentoId` — ficha para el escáner
- `PATCH /participant/:id/confirm-payment` — `{ referenciaComprobante }` (ADMIN / COORDINADOR)
- `PATCH /participant/:id/fix-typo` — corrección tipográfica (ADMIN / LOGISTICA)
- `PATCH /participant/:id/status` — `cancelado` / `no_asistira` desde `registrado`
- `PATCH /participant/:id/lodging` — `habitacionAsignada`
- `POST /scan/validate` — `{ publicToken, accion: 'checkin' | 'checkout' }`

## Roles

| Rol | Panel | Notas |
|---|---|---|
| `SUPER_ADMIN` | Sí | Todo, incluido asignar `SUPER_ADMIN` |
| `ADMIN` | Sí | Usuarios (excepto crear/editar `SUPER_ADMIN`), pagos y escáner |
| `COORDINADOR` | Sí | Listado y confirmar pago |
| `LOGISTICA` | Sí | Escáner y corrección tipográfica |
| `MISIONERO` | No | Compatibilidad |
| `PARTICIPANTE` | No | Cuenta de sistema, no es el asistente del evento |

El asistente del evento es el modelo **Participant** (`tipo`: misionero, coordinador, ponente, sacerdote, obispo), no el rol de login.

## Estructura

```
src/
  config/                 # DB, CORS, roles, aforo, rutas
  components/user/        # cuentas de staff
  components/participant/ # registro y acreditación
  components/scan/        # check-in / check-out
  middleware/             # auth JWT, seed, rate limit, mail, storage
  documentation/          # Swagger
  utils/
```
