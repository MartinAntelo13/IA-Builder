import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES, TEAM_PAGE_SIZE } from '@/constants';
import { transformTeamMember } from '@/lib/transformers/team';
import type { RoleCatalog } from '@/lib/transformers/team';
import { TeamMetricsCards } from '@/components/team/team-metrics-cards';
import { TeamList } from '@/components/team/team-list';

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

  // EXCEPTION (Regla 10): no existe RPC de catálogo de roles
  const rolesResult = await supabase.from('roles').select('id, code, name').order('name');
  if (rolesResult.error) throw new Error(rolesResult.error.message);
  const roles = (rolesResult.data ?? []) as RoleCatalog[];

  // Validar role param contra el catálogo; si no existe, ignorarlo (mostrar todo)
  const validRole =
    roleParam && roles.some((r) => r.code === roleParam) ? roleParam : undefined;

  const [summaryResult, membersResult] = await Promise.all([
    supabase.rpc('get_team_summary'),
    supabase.rpc('list_team_members', {
      p_search: q || undefined,
      p_role_code: validRole,
      p_page: page,
      p_page_size: TEAM_PAGE_SIZE,
    }),
  ]);

  if (summaryResult.error) throw new Error(summaryResult.error.message);
  if (membersResult.error) throw new Error(membersResult.error.message);

  const rawMembers = membersResult.data ?? [];
  const totalCount = rawMembers[0]?.total_count ?? 0;
  const members = rawMembers.map(transformTeamMember);
  const totalPages = Math.max(1, Math.ceil(totalCount / TEAM_PAGE_SIZE));

  if (members.length === 0 && page > 1) {
    const safeParams = new URLSearchParams();
    if (q) safeParams.set('q', q);
    if (validRole) safeParams.set('role', validRole);
    redirect(`${ROUTES.TEAM}?${safeParams.toString()}`);
  }

  const summaryRow = summaryResult.data?.[0] ?? null;
  const displayRole = validRole ?? '';

  return (
    <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12">
      <header className="mb-6">
        <p className="text-2xs font-bold tracking-wider text-muted uppercase">
          GESTIÓN DEL ESPACIO
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight mt-0.5">Equipo</h1>
        <p className="text-2xs text-muted mt-1">
          Administra los miembros y sus permisos en tu espacio de trabajo.
        </p>
      </header>

      {summaryRow && <TeamMetricsCards summary={summaryRow} />}

      <TeamList
        members={members}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        roles={roles}
        q={q}
        role={displayRole}
      />
    </div>
  );
}
