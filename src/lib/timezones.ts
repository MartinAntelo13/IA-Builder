// 'UTC' puede estar ausente de Intl.supportedValuesOf en algunos runtimes;
// se agrega explícitamente para que sea siempre una opción válida.
const anyIntl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
const INTL_ZONES: readonly string[] = anyIntl.supportedValuesOf?.('timeZone') ?? [];

const _set = new Set(['UTC', ...INTL_ZONES]);
export const TIMEZONES: readonly string[] = [..._set].sort();

const _validSet = new Set(TIMEZONES);
export function isSupportedTimezone(tz: string): boolean {
  return _validSet.has(tz);
}
