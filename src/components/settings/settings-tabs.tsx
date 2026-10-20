// Regla 3: 'use client' — Links que pisan ?tab=…; si el formulario del tab
// activo tiene cambios sin guardar, intercepta el clic y muestra un diálogo
// de confirmación antes de navegar.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useSettingsSave } from '@/components/settings/save-context';
import { DiscardChangesDialog } from '@/components/settings/discard-changes-dialog';

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
  const router = useRouter();
  const { isDirty } = useSettingsSave();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const items = BASE_ITEMS.filter(
    (it) => it.value !== 'workspace' || canManageOrganization,
  );

  return (
    <>
      <nav
        aria-label="Secciones de configuración"
        className="w-56 shrink-0 bg-card border border-border rounded-lg shadow-sm p-2 flex flex-col gap-1 max-md:w-full max-md:flex-row max-md:overflow-x-auto"
      >
        {items.map((it) => {
          const isActive = active === it.value;
          const href = `${ROUTES.SETTINGS}?tab=${it.value}`;
          return (
            <Link
              key={it.value}
              href={href}
              scroll={false}
              onClick={(e) => {
                // Con modificadores o botón no-primario, dejar el comportamiento por
                // defecto (abrir en pestaña nueva, copiar link, etc.).
                const hasModifier = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
                if (hasModifier || e.button !== 0) return;
                if (isDirty && !isActive) {
                  e.preventDefault();
                  setPendingHref(href);
                }
              }}
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
      {pendingHref !== null && (
        <DiscardChangesDialog
          onStay={() => setPendingHref(null)}
          onDiscard={() => {
            const href = pendingHref;
            setPendingHref(null);
            router.push(href, { scroll: false });
          }}
        />
      )}
    </>
  );
}
