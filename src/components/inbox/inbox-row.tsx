import Link from 'next/link';
import { FileText, Clock } from 'lucide-react';
import type { InboxRow } from '@/lib/transformers/inbox';
import { PRIORITY_STYLES, ROUTES } from '@/constants';
import { formatCurrency, formatRelativeTime, formatDecision } from '@/lib/format-helpers';
import { InboxRowActions } from '@/components/inbox/inbox-row-actions';

interface InboxRowProps {
  row: InboxRow;
  tab: 'pending' | 'reviewed';
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

export function InboxRowItem({ row, tab }: InboxRowProps) {
  const priority = PRIORITY_STYLES[row.priority] ?? PRIORITY_STYLES.normal;
  const amountStr =
    row.amount > 0 ? formatCurrency(row.amount, row.currencySymbol) : 'Sin coste';

  const timeStr =
    tab === 'reviewed'
      ? formatRelativeTime(row.myDecidedAt)
      : formatRelativeTime(row.stepActivatedAt);

  const detailHref = `${ROUTES.REQUESTS}/${row.requestId}`;

  return (
    <div className="relative flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0">
      <Link
        href={detailHref}
        className="absolute inset-0"
        aria-label={`Ver solicitud ${row.code}`}
      />

      <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-md bg-primary/10 grid place-items-center shrink-0 self-start mt-0.5">
          <FileText size={16} className="text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <Link
              href={detailHref}
              className="text-xs font-semibold text-foreground hover:text-primary hover:underline focus-visible:underline truncate"
            >
              {row.title}
            </Link>
            <span className="text-2xs text-muted shrink-0">{row.code}</span>
          </div>

          {row.description && (
            <p className="mt-0.5 text-2xs text-muted line-clamp-1">{row.description}</p>
          )}

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1.5">
              <RequesterAvatar name={row.requesterName} />
              <span className="text-2xs text-muted">{row.requesterName}</span>
            </span>
            <span className="flex items-center gap-1 text-2xs text-muted">
              <Clock size={11} />
              {timeStr}
            </span>
            {tab === 'reviewed' && row.myDecision ? (
              <span className="text-2xs text-muted font-medium">
                {formatDecision(row.myDecision)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-2xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    row.priority === 'high'
                      ? 'bg-danger'
                      : row.priority === 'low'
                        ? 'bg-muted'
                        : 'bg-accent'
                  }`}
                />
                <span className={`px-1.5 py-0.5 rounded text-2xs font-medium ${priority.badge}`}>
                  {priority.label}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 shrink-0 ml-2">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">{amountStr}</span>
        {tab === 'pending' && (
          <InboxRowActions
            requestId={row.requestId}
            code={row.code}
            title={row.title}
          />
        )}
      </div>
    </div>
  );
}
