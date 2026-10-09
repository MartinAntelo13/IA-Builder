import Link from 'next/link';
import type { ReactNode } from 'react';
import { FileText, Clock, ChevronRight } from 'lucide-react';

interface RequestRowItemProps {
  code: string;
  title: string;
  detailHref: string;
  requesterName: string;
  timeStr: string;
  amountStr: string;
  description?: string | null;
  badge?: ReactNode;
  // undefined → chevron por defecto; null → sin acción (p. ej. inbox reviewed).
  rightAction?: ReactNode | null;
}

function RequesterAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-2xs font-bold shrink-0">
      {initials}
    </span>
  );
}

export function RequestRowItem({
  code,
  title,
  detailHref,
  requesterName,
  timeStr,
  amountStr,
  description,
  badge,
  rightAction,
}: RequestRowItemProps) {
  const showAction = rightAction !== null;
  const actionContent =
    rightAction === undefined ? (
      <Link
        href={detailHref}
        aria-label={`Ver detalle de ${code}`}
        className="h-9 w-9 grid place-items-center rounded-md text-muted hover:bg-surface hover:text-foreground transition-colors"
      >
        <ChevronRight size={16} />
      </Link>
    ) : (
      rightAction
    );

  return (
    <div className="relative flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0">
      <div className="w-9 h-9 rounded-md bg-primary/10 grid place-items-center shrink-0 self-start mt-0.5">
        <FileText size={16} className="text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <Link
            href={detailHref}
            className="text-xs font-semibold text-foreground hover:text-primary hover:underline focus-visible:underline truncate after:absolute after:inset-0"
          >
            {title}
          </Link>
          <span className="text-2xs text-muted shrink-0">{code}</span>
        </div>

        {description && (
          <p className="mt-0.5 text-2xs text-muted line-clamp-1">{description}</p>
        )}

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <RequesterAvatar name={requesterName} />
            <span className="text-2xs text-muted">{requesterName}</span>
          </span>
          <span className="flex items-center gap-1 text-2xs text-muted">
            <Clock size={11} />
            {timeStr}
          </span>
          {badge}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">{amountStr}</span>
        {showAction && (
          <div className="relative z-10 flex items-center">{actionContent}</div>
        )}
      </div>
    </div>
  );
}
