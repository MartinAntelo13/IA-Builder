import { redirect } from 'next/navigation';
import {
  createSupabaseServerClient,
  getCurrentProfile,
} from '@/lib/supabase/server';
import { getUserPermissions } from '@/lib/auth/permissions';
import { PERMISSIONS, ROUTES } from '@/constants';
import { SettingsShell } from '@/components/settings/settings-shell';
import type { Database } from '@/types/database.types';
import type { SettingsTab } from '@/components/settings/settings-tabs';

type OrganizationRow = Database['public']['Tables']['organizations']['Row'];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(val: string | string[] | undefined): string {
  return typeof val === 'string' ? val : '';
}

const VALID_TABS: readonly SettingsTab[] = [
  'perfil',
  'notificaciones',
  'workspace',
  'seguridad',
];

export default async function SettingsPage({ searchParams }: PageProps) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(ROUTES.LOGIN);

  const permissions = await getUserPermissions();
  const canManageOrganization = permissions.has(PERMISSIONS.ORG_MANAGE);

  // Sesión actual: necesitamos last_sign_in_at para la pestaña Seguridad.
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lastSignInAt = user?.last_sign_in_at ?? null;

  // Pestaña activa: default perfil; workspace sin permiso cae en perfil.
  const rawTab = getString((await searchParams).tab);
  const requested = (VALID_TABS as readonly string[]).includes(rawTab)
    ? (rawTab as SettingsTab)
    : 'perfil';
  const tab: SettingsTab =
    requested === 'workspace' && !canManageOrganization ? 'perfil' : requested;

  // Organización completa (solo si tiene permiso para editarla).
  // EXCEPTION (Regla 10): no hay RPC para leer la organización completa; se
  // consulta la tabla directamente (RLS filtra por organización del usuario).
  const organization: OrganizationRow | null = canManageOrganization
    ? await loadOrganization(profile.organizationId)
    : null;

  return (
    <SettingsShell
      tab={tab}
      canManageOrganization={canManageOrganization}
      profile={{
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        timezone: profile.timezone,
        roleNames: profile.roles.map((r) => r.name),
      }}
      orgTimezone={profile.organization?.timezone ?? null}
      organization={organization}
      lastSignInAt={lastSignInAt}
    />
  );
}

async function loadOrganization(
  organizationId: string,
): Promise<OrganizationRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
