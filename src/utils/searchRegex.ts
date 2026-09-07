/**
 * Utilidades compartidas para búsquedas con regex anclado (evita full collection scans).
 */

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildAnchoredSearchRegex(
  term: string
): { $regex: string; $options: "i" } {
  const trimmed = term.trim();
  return {
    $regex: `^${escapeRegex(trimmed)}`,
    $options: "i",
  };
}

export function buildAnchoredSearchOr(
  term: string,
  fields: string[]
): Array<Record<string, { $regex: string; $options: "i" }>> {
  const regex = buildAnchoredSearchRegex(term);
  return fields.map((field) => ({ [field]: regex }));
}
