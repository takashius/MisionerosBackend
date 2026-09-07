export const CAPACITY_ESTIMATE = 60;
export const CAPACITY_MAX = 80;
export const LODGING_SLOTS = 60;

export const PARTICIPANT_TYPES = [
  "misionero",
  "coordinador",
  "ponente",
  "sacerdote",
  "obispo",
] as const;

export type ParticipantType = (typeof PARTICIPANT_TYPES)[number];

export const PARTICIPANT_STATES = [
  "registrado",
  "confirmado",
  "cancelado",
  "no_asistira",
  "checkin_realizado",
  "checkout_realizado",
] as const;

export type ParticipantState = (typeof PARTICIPANT_STATES)[number];

export const ACTIVE_REGISTRATION_STATES: ParticipantState[] = [
  "registrado",
  "confirmado",
  "checkin_realizado",
  "checkout_realizado",
];

export const BADGE_STATES: ParticipantState[] = [
  "confirmado",
  "checkin_realizado",
  "checkout_realizado",
];

export const CANCEL_STATES: ParticipantState[] = ["cancelado", "no_asistira"];

export const SEXOS = ["M", "F"] as const;
export type Sexo = (typeof SEXOS)[number];

export const SCAN_ACTIONS = ["checkin", "checkout", "alojamiento_entrega"] as const;
export type ScanAction = (typeof SCAN_ACTIONS)[number];

export function isParticipantType(value: unknown): value is ParticipantType {
  return typeof value === "string" && PARTICIPANT_TYPES.includes(value as ParticipantType);
}

export function isParticipantState(value: unknown): value is ParticipantState {
  return typeof value === "string" && PARTICIPANT_STATES.includes(value as ParticipantState);
}

export function normalizeDocumentoId(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}
