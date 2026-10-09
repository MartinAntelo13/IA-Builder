'use client';
// Regla 3: 'use client' — <select> controlado (value/onChange).

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { SELECT_WITH_CHEVRON } from '@/lib/ui/form-classes';
import { TIMEZONES } from '@/lib/timezones';

interface TimezoneSelectProps {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  // Cuando es true, agrega la opción "Usar la zona de la organización" con value=''.
  allowOrgDefault?: boolean;
  // Etiqueta del fallback (default: "Usar la zona de la organización").
  orgDefaultLabel?: string;
}

export function TimezoneSelect({
  id,
  value,
  onChange,
  disabled = false,
  allowOrgDefault = false,
  orgDefaultLabel = 'Usar la zona de la organización',
}: TimezoneSelectProps) {
  // Garantiza que el valor actual siempre sea una opción visible aunque no esté
  // en TIMEZONES (p. ej. una zona almacenada con una capitalización diferente).
  const timezones = useMemo(
    () => (value && !TIMEZONES.includes(value) ? [value, ...TIMEZONES] : [...TIMEZONES]),
    [value],
  );

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={SELECT_WITH_CHEVRON}
      >
        {allowOrgDefault && <option value="">{orgDefaultLabel}</option>}
        {timezones.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
