// Pestaña "Notificaciones" — Server Component estático.
// No funcional en esta fase: toggles deshabilitados y aviso visible.
// TODO: falta tabla de preferencias de notificación y envío de emails.

import { Bell, Info } from 'lucide-react';

interface Toggle {
  label: string;
  description: string;
  defaultChecked: boolean;
}

const TOGGLES: readonly Toggle[] = [
  {
    label: 'Resumen diario',
    description: 'Recibí un resumen de la actividad de tu espacio.',
    defaultChecked: true,
  },
  {
    label: 'Solicitudes pendientes',
    description: 'Avisos cuando una solicitud requiera tu aprobación.',
    defaultChecked: true,
  },
  {
    label: 'Menciones directas',
    description: 'Notificaciones cuando alguien te mencione.',
    defaultChecked: false,
  },
];

export function NotificationsTab() {
  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Notificaciones</h2>
          <p className="mt-1 text-2xs text-muted">
            Elegí cómo querés recibir actualizaciones.
          </p>
        </div>
        <Bell size={20} className="text-primary shrink-0" aria-hidden="true" />
      </div>

      <div className="h-px bg-border my-5" />

      <div
        role="status"
        className="flex items-start gap-2 p-3 rounded-md bg-primary/10 text-primary mb-5"
      >
        <Info size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-2xs">
          Próximamente: las preferencias de notificación todavía no están disponibles.
        </p>
      </div>

      <ul className="divide-y divide-border">
        {TOGGLES.map((t) => (
          <li
            key={t.label}
            className="flex items-start justify-between gap-4 py-4"
            aria-disabled="true"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">{t.label}</p>
              <p className="mt-0.5 text-2xs text-muted">{t.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={t.defaultChecked}
              aria-disabled="true"
              disabled
              className={
                t.defaultChecked
                  ? 'relative w-10 h-5 rounded-full bg-primary opacity-50 cursor-not-allowed shrink-0'
                  : 'relative w-10 h-5 rounded-full bg-border opacity-70 cursor-not-allowed shrink-0'
              }
            >
              <span
                className={
                  t.defaultChecked
                    ? 'absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white'
                    : 'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white'
                }
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
