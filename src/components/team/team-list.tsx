import { ROUTES, TEAM_PAGE_SIZE } from '@/constants';
import { Pagination } from '@/components/shared/pagination';
import { TeamFilters } from '@/components/team/team-filters';
import { TeamMemberRow } from '@/components/team/team-member-row';
import type {
  TeamMember,
  RoleCatalog,
  DepartmentOption,
  ManagerOption,
} from '@/lib/transformers/team';

interface TeamListProps {
  members: TeamMember[];
  totalCount: number;
  page: number;
  totalPages: number;
  roles: RoleCatalog[];
  departments: DepartmentOption[];
  managerOptions: ManagerOption[];
  currentUserId: string | null;
  q: string;
  role: string;
}

export function TeamList({
  members,
  totalCount,
  page,
  totalPages,
  roles,
  departments,
  managerOptions,
  currentUserId,
  q,
  role,
}: TeamListProps) {
  const paginationParams: Record<string, string> = {};
  if (q) paginationParams.q = q;
  if (role) paginationParams.role = role;

  return (
    <article className="bg-white border border-border rounded-lg shadow-sm mt-6">
      {/* Encabezado del card */}
      <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Miembros</h2>
          <p className="text-2xs text-muted mt-0.5">
            {members.length} {members.length === 1 ? 'miembro mostrado' : 'miembros mostrados'}
          </p>
        </div>
        <TeamFilters roles={roles} q={q} role={role} />
      </div>

      {/* Cabecera de columnas — solo desktop (incluye hueco para el menú ···) */}
      <div className="hidden md:flex items-center gap-6 px-6 py-3 border-t border-border bg-surface">
        <span className="flex-1 text-2xs font-bold text-muted uppercase tracking-wider">
          Miembro
        </span>
        <span className="w-40 shrink-0 text-2xs font-bold text-muted uppercase tracking-wider">
          Rol
        </span>
        <span className="w-32 shrink-0 text-2xs font-bold text-muted uppercase tracking-wider">
          Estado
        </span>
        <span className="w-40 shrink-0 text-2xs font-bold text-muted uppercase tracking-wider">
          Última actividad
        </span>
        <span className="w-10 shrink-0" aria-hidden="true" />
      </div>

      {/* Filas */}
      <div className="divide-y divide-border border-t border-border md:border-t-0">
        {members.map((member) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            roles={roles}
            departments={departments}
            managerOptions={managerOptions}
          />
        ))}
        {members.length === 0 && (
          <p className="px-6 py-10 text-2xs text-muted text-center">
            No hay miembros que coincidan con los filtros.
          </p>
        )}
      </div>

      {/* Pie con paginador */}
      <div className="px-6 py-3 border-t border-border">
        <Pagination
          basePath={ROUTES.TEAM}
          params={paginationParams}
          page={page}
          totalCount={totalCount}
          totalPages={totalPages}
          pageSize={TEAM_PAGE_SIZE}
          itemLabel="miembros"
        />
      </div>
    </article>
  );
}
