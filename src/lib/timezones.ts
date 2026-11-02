/**
 * Zonas horarias IANA (nombres canónicos presentes en Node y en navegadores).
 * Lista fija y ordenada: generarla con Intl difiere entre servidor y cliente
 * (p. ej. Africa/Asmara vs Africa/Asmera) y rompe la hidratación.
 */
export const TIMEZONES: readonly string[] = [
  'Africa/Abidjan',
  'Africa/Algiers',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'America/Anchorage',
  'America/Argentina/Buenos_Aires',
  'America/Asuncion',
  'America/Bogota',
  'America/Caracas',
  'America/Chicago',
  'America/Costa_Rica',
  'America/Denver',
  'America/Guatemala',
  'America/Guayaquil',
  'America/Halifax',
  'America/Havana',
  'America/La_Paz',
  'America/Lima',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Montevideo',
  'America/New_York',
  'America/Panama',
  'America/Phoenix',
  'America/Puerto_Rico',
  'America/Santiago',
  'America/Santo_Domingo',
  'America/Sao_Paulo',
  'America/St_Johns',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Bangkok',
  'Asia/Dhaka',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Jerusalem',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Manila',
  'Asia/Riyadh',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tehran',
  'Asia/Tokyo',
  'Atlantic/Azores',
  'Atlantic/Reykjavik',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Berlin',
  'Europe/Brussels',
  'Europe/Dublin',
  'Europe/Istanbul',
  'Europe/Kyiv',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Vienna',
  'Europe/Warsaw',
  'Europe/Zurich',
  'Pacific/Auckland',
  'Pacific/Honolulu',
  'UTC',
];

// Solo se usa en el servidor: acepta cualquier zona IANA válida, aunque no esté
// en TIMEZONES (p. ej. una zona ya guardada que el select muestra igual).
export function isSupportedTimezone(tz: string): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
