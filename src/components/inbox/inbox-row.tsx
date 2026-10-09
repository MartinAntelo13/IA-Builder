import type { InboxRow } from '@/lib/transformers/inbox';
import { PRIORITY_STYLES, ROUTES } from '@/constants';
import {
  formatAmountOrFree,
  formatRelativeTime,
  formatDecision,
} from '@/lib/format-helpers';
import { InboxRowActions } from '@/components/inbox/inbox-row-actions';
import { RequestRowItem } from '@/components/requests/request-row';

interface InboxRowProps {
  row: InboxRow;
  tab: 'pending' | 'reviewed';
}

export function InboxRowItem({ row, tab }: InboxRowProps) {
  const priority = PRIORITY_STYLES[row.priority] ?? PRIORITY_STYLES.normal;
  const amountStr = formatAmountOrFree(row.amount, row.currencySymbol);
  const timeStr =
    tab === 'reviewed'
      ? formatRelativeTime(row.myDecidedAt)
      : formatRelativeTime(row.stepActivatedAt);
  const detailHref = `${ROUTES.REQUESTS}/${row.requestId}`;

  const badge =
    tab === 'reviewed' && row.myDecision ? (
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
    );

  const rightAction =
    tab === 'pending' ? (
      <InboxRowActions requestId={row.requestId} code={row.code} title={row.title} />
    ) : null;

  return (
    <RequestRowItem
      code={row.code}
      title={row.title}
      detailHref={detailHref}
      requesterName={row.requesterName}
      timeStr={timeStr}
      amountStr={amountStr}
      description={row.description}
      badge={badge}
      rightAction={rightAction}
    />
  );
}
