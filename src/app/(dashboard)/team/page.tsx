import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getCurrentProfile } from '@/lib/supabase/server';
import { ROUTES, TEAM_PAGE_SIZE } from '@/constants';
import { transformTeamMember } from '@/lib/transformers/team';
import type { ProfileExtras } from '@/lib/transformers/team';
import type { Database } from '@/types/database.types';
import { TeamMetricsCards } from '@/components/team/team-metrics-cards';
import { TeamList } from '@/components/team/team-list';
import { InviteMemberButton } from '@/components/team/invite-member-button';

// Fila devuelta por el RPC list_team_members (Regla 7 — tipo generado).
type TeamMemberRow = Database['public']['Functions']['list_team_members']['Returns'][number];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(val: string | string[] | undefined): string {
  return typeof val === 'string' ? val : '';
}

export default async function TeamPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const q = getString(params.q).trim().slice(0, 100);
  const roleParam = getString(params.role);
  const rawPage = parseInt(getString(params.page) || '1', 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const supabase = await createSupabaseServerClient();

  // getCurrentProfile está cacheado (ya lo resolvió el layout); no suma roundtrips.
  const currentProfile = await getCurrentProfile();
  const currentUserId = currentProfile?.id ?? null;

  // EXCEPTION (Regla 10): no existe RPC de catálogo de roles
  const rolesResult = await supabase.from('roles').select('id, code, name').order('name');
  if (rolesResult.error) throw new Error(rolesResult.error.message);
  const roles = rolesResult.data ?? [];

  // Validar role param contra el catálogo; si no existe, ignorarlo (mostrar todo)
  const validRole =
    roleParam && roles.some((r) => r.code === roleParam) ? roleParam : undefined;

  const [summaryResult, membersResult, departmentsResult, managerOptionsResult] =
    await Promise.all([
      supabase.rpc('get_team_summary'),
      supabase.rpc('list_team_members', {
        p_search: q || undefined,
        p_role_code: validRole,
        p_page: page,
        p_page_size: TEAM_PAGE_SIZE,
      }),
      // EXCEPTION (Regla 10): no existe RPC de catálogo de departamentos
      supabase.from('departments').select('id, name').order('name'),
      // EXCEPTION (Regla 10): no existe RPC de opciones de responsable
      supabase
        .from('profiles')
        .select('id, full_name')
        .neq('status', 'disabled')
        .order('full_name'),
    ]);

  if (summaryResult.error) throw new Error(summaryResult.error.message);
  if (membersResult.error) throw new Error(membersResult.error.message);
  if (departmentsResult.error) throw new Error(departmentsResult.error.message);
  if (managerOptionsResult.error) throw new Error(managerOptionsResult.error.message);

  // La inferencia del Promise.all con tipos heterogéneos (.rpc + .from) colapsa
  // el tipo de membersResult.data a any; se anota explícitamente desde el tipo
  // generado por supabase (Regla 7).
  const rawMembers: TeamMemberRow[] = membersResult.data ?? [];
  const memberIds = rawMembers.map((m) => m.id);

  // TODO: esta query no entra en el Promise.all anterior porque depende de los
  // memberIds que recién se conocen cuando vuelve list_team_members.
  const extrasByUserId = new Map<string, ProfileExtras>();
  if (memberIds.length > 0) {
    const extrasResult = await supabase
      .from('profiles')
      .select('id, department_id, manager_id')
      .in('id', memberIds);
    if (extrasResult.error) throw new Error(extrasResult.error.message);
    for (const row of extrasResult.data ?? []) {
      extrasByUserId.set(row.id, {
        departmentId: row.department_id,
        managerId: row.manager_id,
      });
    }
  }

  const totalCount = rawMembers[0]?.total_count ?? 0;
  const members = rawMembers.map((m) => transformTeamMember(m, extrasByUserId));
  const totalPages = Math.max(1, Math.ceil(totalCount / TEAM_PAGE_SIZE));

  if (members.length === 0 && page > 1) {
    const safeParams = new URLSearchParams();
    if (q) safeParams.set('q', q);
    if (validRole) safeParams.set('role', validRole);
    redirect(`${ROUTES.TEAM}?${safeParams.toString()}`);
  }

  const summaryRow = summaryResult.data?.[0] ?? null;
  const departments = departmentsResult.data ?? [];
  const managerOptions = (managerOptionsResult.data ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
  }));
  const displayRole = validRole ?? '';

  return (
    <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12">
      <header className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-2xs font-bold tracking-wider text-muted uppercase">
            GESTIÓN DEL ESPACIO
          </p>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight mt-0.5">Equipo</h1>
          <p className="text-2xs text-muted mt-1">
            Administra los miembros y sus permisos en tu espacio de trabajo.
          </p>
        </div>
        <InviteMemberButton
          roles={roles}
          departments={departments}
          managerOptions={managerOptions}
        />
      </header>

      {summaryRow && <TeamMetricsCards summary={summaryRow} />}

      <TeamList
        members={members}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        roles={roles}
        departments={departments}
        managerOptions={managerOptions}
        currentUserId={currentUserId}
        q={q}
        role={displayRole}
      />
    </div>
  );
}
