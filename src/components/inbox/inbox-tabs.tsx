import Link from 'next/link';
import { ROUTES } from '@/constants';

interface InboxTabsProps {
  tab: 'pending' | 'reviewed';
  sort: string;
  q: string;
  pendingCount: number;
  reviewedCount: number;
}

function tabHref(targetTab: string, sort: string, q: string): string {
  const p = new URLSearchParams();
  p.set('tab', targetTab);
  if (sort !== 'newest') p.set('sort', sort);
  if (q) p.set('q', q);
  return `${ROUTES.INBOX}?${p.toString()}`;
}

export function InboxTabs({ tab, sort, q, pendingCount, reviewedCount }: InboxTabsProps) {
  return (
    <div className="flex gap-1 px-4 pt-4 border-b border-border">
      <Link
        href={tabHref('pending', sort, q)}
        className={[
          'flex items-center gap-1.5 px-3 pb-3 text-xs font-medium border-b-2 -mb-px transition-colors',
          tab === 'pending'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted hover:text-foreground',
        ].join(' ')}
      >
        Pendientes
        <span
          className={[
            'inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-2xs font-bold',
            tab === 'pending'
              ? 'bg-primary text-primary-foreground'
              : 'bg-border text-muted',
          ].join(' ')}
        >
          {pendingCount}
        </span>
      </Link>
      <Link
        href={tabHref('reviewed', sort, q)}
        className={[
          'flex items-center gap-1.5 px-3 pb-3 text-xs font-medium border-b-2 -mb-px transition-colors',
          tab === 'reviewed'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted hover:text-foreground',
        ].join(' ')}
      >
        Revisadas
        <span
          className={[
            'inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-2xs font-bold',
            tab === 'reviewed'
              ? 'bg-primary text-primary-foreground'
              : 'bg-border text-muted',
          ].join(' ')}
        >
          {reviewedCount}
        </span>
      </Link>
    </div>
  );
}
