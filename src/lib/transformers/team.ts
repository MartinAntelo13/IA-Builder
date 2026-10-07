import type { Database } from '@/types/database.types';
import { formatRelativeTime } from '@/lib/format-helpers';

type ProfileStatus = Database['public']['Enums']['profile_status'];

export type TeamSummaryRow =
  Database['public']['Functions']['get_team_summary']['Returns'][number];

type TeamMemberRow =
  Database['public']['Functions']['list_team_members']['Returns'][number];

export type RoleCatalog = Pick<
  Database['public']['Tables']['roles']['Row'],
  'id' | 'code' | 'name'
>;

const STATUS_LABELS: Record<ProfileStatus, string> = {
  active: 'Activo',
  invited: 'Pendiente',
  disabled: 'Deshabilitado',
};

export function transformTeamMember(row: TeamMemberRow) {
  const words = (row.full_name ?? '').trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((w) => (w[0] ?? '').toUpperCase())
    .join('');

  const roleLabel = row.role_names[0] ?? null;
  const extraRoles = Math.max(0, row.role_names.length - 1);
  const statusLabel = STATUS_LABELS[row.status];

  let lastActivityLabel: string;
  if (row.status === 'invited') {
    lastActivityLabel = 'Invitación enviada';
  } else if (row.last_active_at) {
    lastActivityLabel = formatRelativeTime(row.last_active_at);
  } else {
    lastActivityLabel = '—';
  }

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
  };
}

export type TeamMember = ReturnType<typeof transformTeamMember>;
