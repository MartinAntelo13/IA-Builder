'use client';
// Regla 3: 'use client' — Links que pisan ?tab=... manteniendo pathname;
// usePathname + usa el patrón de pathname.startsWith para marcar activa.

import Link from 'next/link';
import { ROUTES } from '@/constants';

export type SettingsTab = 'perfil' | 'notificaciones' | 'workspace' | 'seguridad';

interface Item {
  value: SettingsTab;
  label: string;
}

const BASE_ITEMS: readonly Item[] = [
  { value: 'perfil', label: 'Perfil' },
  { value: 'notificaciones', label: 'Notificaciones' },
  { value: 'workspace', label: 'Espacio de trabajo' },
  { value: 'seguridad', label: 'Seguridad' },
];

interface SettingsTabsProps {
  active: SettingsTab;
  canManageOrganization: boolean;
}

export function SettingsTabs({ active, canManageOrganization }: SettingsTabsProps) {
  const items = BASE_ITEMS.filter(
    (it) => it.value !== 'workspace' || canManageOrganization,
  );

  return (
    <nav
      aria-label="Secciones de configuración"
      className="w-56 shrink-0 bg-white border border-border rounded-lg shadow-sm p-2 flex flex-col gap-1 max-md:w-full max-md:flex-row max-md:overflow-x-auto"
    >
      {items.map((it) => {
        const isActive = active === it.value;
        return (
          <Link
            key={it.value}
            href={`${ROUTES.SETTINGS}?tab=${it.value}`}
            scroll={false}
            className={
              isActive
                ? 'px-3 py-2 rounded-md text-xs font-semibold bg-primary/10 text-primary'
                : 'px-3 py-2 rounded-md text-xs text-muted hover:bg-surface hover:text-foreground whitespace-nowrap'
            }
            aria-current={isActive ? 'page' : undefined}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
