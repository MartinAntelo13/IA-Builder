import { buildCriticalRolesMessage, type CriticalRolesMode } from '@/lib/team/critical-roles-message';

interface CriticalRolesWarningProps {
  names: readonly string[];
  mode: CriticalRolesMode;
}

export function CriticalRolesWarning({ names, mode }: CriticalRolesWarningProps) {
  if (names.length === 0) return null;
  return (
    <div className="mb-4 p-2.5 bg-warning-bg rounded text-2xs text-warning leading-relaxed">
      {buildCriticalRolesMessage(names, mode)}
    </div>
  );
}
