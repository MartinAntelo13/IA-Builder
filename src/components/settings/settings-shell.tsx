import { Settings2 } from 'lucide-react';
import { SettingsSaveProvider } from '@/components/settings/save-context';
import { SettingsTabs, type SettingsTab } from '@/components/settings/settings-tabs';
import { SaveButton } from '@/components/settings/save-button';
import { ProfileTab } from '@/components/settings/profile-tab';
import { NotificationsTab } from '@/components/settings/notifications-tab';
import { WorkspaceTab } from '@/components/settings/workspace-tab';
import { SecurityTab } from '@/components/settings/security-tab';
import type { Database } from '@/types/database.types';

type OrganizationRow = Database['public']['Tables']['organizations']['Row'];

interface ProfileLite {
  id: string;
  email: string;
  fullName: string;
  timezone: string | null;
  roleNames: string[];
}

interface SettingsShellProps {
  tab: SettingsTab;
  canManageOrganization: boolean;
  profile: ProfileLite;
  orgTimezone: string | null;
  organization: OrganizationRow | null;
  lastSignInAt: string | null;
}

// Formatea last_sign_in_at con Intl + zona del perfil (o la de la organización,
// o UTC) para la pestaña Seguridad.
function formatLastSignIn(iso: string | null, tz: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const timeZone = tz ?? 'UTC';
  try {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}

export function SettingsShell({
  tab,
  canManageOrganization,
  profile,
  orgTimezone,
  organization,
  lastSignInAt,
}: SettingsShellProps) {
  const sessionTz = profile.timezone ?? orgTimezone ?? null;
  const lastSignInLabel = formatLastSignIn(lastSignInAt, sessionTz);

  return (
    <SettingsSaveProvider>
      <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0 mt-0.5">
              <Settings2 size={18} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-foreground text-2xl font-semibold tracking-tight">Configuración</h1>
              <p className="text-2xs text-muted mt-1">
                Personalizá tu experiencia en Flowdesk y gestioná tu espacio de trabajo.
              </p>
            </div>
          </div>
          <SaveButton />
        </header>

        {/* Layout: tabs + content */}
        <div className="flex gap-5 items-start max-md:flex-col">
          <SettingsTabs active={tab} canManageOrganization={canManageOrganization} />

          <section className="flex-1 min-w-0 bg-white border border-border rounded-lg shadow-sm px-6 py-5 max-md:px-4">
            {tab === 'perfil' && <ProfileTab profile={profile} />}
            {tab === 'notificaciones' && <NotificationsTab />}
            {tab === 'workspace' && organization && (
              <WorkspaceTab organization={organization} />
            )}
            {tab === 'seguridad' && <SecurityTab lastSignInLabel={lastSignInLabel} />}
          </section>
        </div>
      </div>
    </SettingsSaveProvider>
  );
}
