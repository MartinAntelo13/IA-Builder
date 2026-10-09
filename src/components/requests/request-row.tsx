import Link from 'next/link';
import { FileText, Clock, ChevronRight } from 'lucide-react';
import { REQUEST_STATUS_STYLES, ROUTES } from '@/constants';
import { formatCurrency, formatRelativeTime } from '@/lib/format-helpers';
import type { RequestRow } from '@/lib/transformers/requests';

interface RequestRowItemProps {
  row: RequestRow;
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

export function RequestRowItem({ row }: RequestRowItemProps) {
  const amountStr =
    row.amount !== null && row.amount > 0 && row.currencySymbol
      ? formatCurrency(row.amount, row.currencySymbol)
      : 'Sin coste';

  const timeStr = formatRelativeTime(row.submittedAt);
  const status = REQUEST_STATUS_STYLES[row.status];
  const detailHref = `${ROUTES.REQUESTS}/${row.id}`;

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
            {row.title}
          </Link>
          <span className="text-2xs text-muted shrink-0">{row.code}</span>
        </div>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <RequesterAvatar name={row.requesterName} />
            <span className="text-2xs text-muted">{row.requesterName}</span>
          </span>
          <span className="flex items-center gap-1 text-2xs text-muted">
            <Clock size={11} />
            {timeStr}
          </span>
          {status && (
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-2xs font-bold whitespace-nowrap ring-1 ring-inset ${status.badge}`}
            >
              {status.label}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">{amountStr}</span>
        <Link
          href={detailHref}
          aria-label={`Ver detalle de ${row.code}`}
          className="relative z-10 h-9 w-9 grid place-items-center rounded-md text-muted hover:bg-surface hover:text-foreground transition-colors"
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
