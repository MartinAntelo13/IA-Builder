import type { Database } from '@/types/database.types';
import type {
  TeamMember,
  RoleCatalog,
  DepartmentOption,
  ManagerOption,
} from '@/lib/transformers/team';
import { TeamMemberMenu } from '@/components/team/team-member-menu';

type ProfileStatus = Database['public']['Enums']['profile_status'];

const AVATAR_CLASSES = [
  'bg-success-bg text-success',
  'bg-warning-bg text-warning',
  'bg-danger-bg text-danger',
  'bg-primary-muted/10 text-primary-muted',
] as const;

function getAvatarClass(id: string): string {
  const hash = id.slice(0, 8).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_CLASSES[hash % AVATAR_CLASSES.length];
}

const STATUS_STYLES: Record<ProfileStatus, { dot: string; text: string }> = {
  active: { dot: 'bg-success', text: 'text-success' },
  invited: { dot: 'bg-warning', text: 'text-warning' },
  disabled: { dot: 'bg-muted', text: 'text-muted' },
};

function StatusBadge({ status, label }: { status: ProfileStatus; label: string }) {
  const s = STATUS_STYLES[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      <span className={`text-2xs ${s.text}`}>{label}</span>
    </span>
  );
}

interface TeamMemberRowProps {
  member: TeamMember;
  currentUserId: string | null;
  roles: RoleCatalog[];
  departments: DepartmentOption[];
  managerOptions: ManagerOption[];
}

export function TeamMemberRow({
  member,
  currentUserId,
  roles,
  departments,
  managerOptions,
}: TeamMemberRowProps) {
  const avatarClass = getAvatarClass(member.id);

  const menu = (
    <TeamMemberMenu
      member={member}
      currentUserId={currentUserId}
      roles={roles}
      departments={departments}
      managerOptions={managerOptions}
    />
  );

  return (
    <div className="hover:bg-surface transition-colors">
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6 px-6 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-full shrink-0 grid place-items-center text-xs font-bold ${avatarClass}`}
          >
            {member.initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{member.fullName}</p>
            <p className="text-2xs text-muted truncate">{member.email}</p>
          </div>
        </div>
        <div className="w-40 shrink-0 text-2xs text-foreground">
          {member.roleLabel ?? '—'}
          {member.extraRoles > 0 && (
            <span className="ml-1 text-muted">+{member.extraRoles}</span>
          )}
        </div>
        <div className="w-32 shrink-0">
          <StatusBadge status={member.status} label={member.statusLabel} />
        </div>
        <div className="w-40 shrink-0 text-2xs text-muted">{member.lastActivityLabel}</div>
        <div className="w-10 shrink-0 flex justify-end">{menu}</div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center gap-3 px-4 py-3">
        <div
          className={`w-9 h-9 rounded-full shrink-0 grid place-items-center text-xs font-bold ${avatarClass}`}
        >
          {member.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{member.fullName}</p>
          <p className="text-2xs text-muted truncate">{member.email}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xs text-muted">
              {member.roleLabel ?? '—'}
              {member.extraRoles > 0 && ` +${member.extraRoles}`}
            </span>
            <StatusBadge status={member.status} label={member.statusLabel} />
          </div>
        </div>
        {menu}
      </div>
    </div>
  );
}
