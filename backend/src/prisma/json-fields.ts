/**
 * MySQL/MariaDB has no native array/JSON-array support on this server (MariaDB 10.1),
 * so fields that were PostgreSQL `String[]` / `Json` are stored as LONGTEXT holding a
 * JSON string. This module centralises the (de)serialization:
 *   • writes  — services call `toJsonString(value)` before persisting
 *   • reads   — a Prisma $use middleware calls `parseJsonFields()` on every result row
 */

/** Prisma model name → fields stored as JSON text. */
export const JSON_FIELDS: Record<string, string[]> = {
  RoomType: ['amenities', 'imageUrls'],
  Room: ['features'],
  Guest: ['tags'],
  GuestPreference: ['dietaryRestrictions', 'spokenLanguages'],
  HousekeepingTask: ['photoUrls'],
  MaintenanceTicket: ['photoUrls'],
  AIAlert: ['metadata'],
  AuditLog: ['beforeState', 'afterState'],
};

/** Serialize an array/object to a JSON string for storage (undefined passes through). */
export function toJsonString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return undefined;
  if (typeof value === 'string') return value; // already serialized
  return JSON.stringify(value);
}

/** Parse a single stored JSON field back to its value. Tolerates bad/legacy data. */
function parseField(raw: unknown): unknown {
  if (typeof raw !== 'string' || raw.length === 0) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Mutate one row in place, parsing any JSON fields declared for `model`. */
function parseRow(model: string, row: Record<string, unknown>): void {
  const fields = JSON_FIELDS[model];
  if (!fields || row == null || typeof row !== 'object') return;
  for (const f of fields) {
    if (f in row) row[f] = parseField(row[f]);
  }
}

/** Parse JSON fields on a query result (single row, array of rows, or null). */
export function parseJsonFields(model: string | undefined, result: unknown): unknown {
  if (!model || !JSON_FIELDS[model] || result == null) return result;
  if (Array.isArray(result)) {
    for (const row of result) parseRow(model, row as Record<string, unknown>);
  } else if (typeof result === 'object') {
    parseRow(model, result as Record<string, unknown>);
  }
  return result;
}
