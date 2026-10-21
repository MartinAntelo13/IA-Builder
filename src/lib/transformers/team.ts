import type { Database } from '@/types/database.types';
import { formatRelativeTime } from '@/lib/format-helpers';
import { getInitials } from '@/lib/initials';

type ProfileStatus = Database['public']['Enums']['profile_status'];

export type TeamSummaryRow =
  Database['public']['Functions']['get_team_summary']['Returns'][number];

type TeamMemberRow =
  Database['public']['Functions']['list_team_members']['Returns'][number];

export type RoleCatalog = Pick<
  Database['public']['Tables']['roles']['Row'],
  'id' | 'code' | 'name'
>;

export type DepartmentOption = Pick<
  Database['public']['Tables']['departments']['Row'],
  'id' | 'name'
>;

export type ManagerOption = { id: string; fullName: string };

export type ProfileExtras = {
  departmentId: Database['public']['Tables']['profiles']['Row']['department_id'];
  managerId: Database['public']['Tables']['profiles']['Row']['manager_id'];
};

const STATUS_LABELS: Record<ProfileStatus, string> = {
  active: 'Activo',
  invited: 'Pendiente',
  disabled: 'Deshabilitado',
};

export function transformTeamMember(
  row: TeamMemberRow,
  extrasByUserId: Map<string, ProfileExtras>,
) {
  const initials = getInitials(row.full_name, row.email);

  const roleLabel = row.role_names[0] ?? null;
  const extraRoles = Math.max(0, row.role_names.length - 1);
  const statusLabel = STATUS_LABELS[row.status];

  const lastActivityLabel =
    row.status === 'invited'
      ? 'Invitación enviada'
      : row.last_active_at
        ? formatRelativeTime(row.last_active_at)
        : '—';

  const extras = extrasByUserId.get(row.id);

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    initials,
    roleLabel,
    extraRoles,
    status: row.status,
    statusLabel,
    lastActivityLabel,
    jobTitle: row.job_title ?? '',
    roleCodes: row.role_codes,
    departmentId: extras?.departmentId ?? null,
    managerId: extras?.managerId ?? null,
  };
}

export type TeamMember = ReturnType<typeof transformTeamMember> & {
  // Nombres de los roles del usuario que, si se deshabilita, dejarían al
  // workflow sin otra persona activa que los cubra. Se calcula en el server
  // (page.tsx) una vez por carga de /team y se pincha a cada miembro.
  criticalRoleNames?: string[];
  // Mensajes adicionales que aplican al deshabilitar: aprobador fijo de pasos
  // ('user') y/o responsable de otros miembros cuando hay pasos 'requester_manager'.
  extraDisableWarnings?: string[];
};
