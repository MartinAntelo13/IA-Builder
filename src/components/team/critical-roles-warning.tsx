import { buildCriticalRolesMessage, type CriticalRolesMode } from '@/lib/team/critical-roles-message';

interface CriticalRolesWarningProps {
  names: readonly string[];
  mode: CriticalRolesMode;
  extraMessages?: readonly string[];
}

export function CriticalRolesWarning({ names, mode, extraMessages = [] }: CriticalRolesWarningProps) {
  const messages: string[] = [];
  if (names.length > 0) messages.push(buildCriticalRolesMessage(names, mode));
  for (const m of extraMessages) messages.push(m);
  if (messages.length === 0) return null;
  return (
    <div className="mb-4 p-2.5 bg-warning-bg rounded text-2xs text-warning leading-relaxed">
      {messages.map((msg, i) => (
        <p key={i} className={i === 0 ? 'm-0' : 'm-0 mt-1.5'}>
          {msg}
        </p>
      ))}
    </div>
  );
}
