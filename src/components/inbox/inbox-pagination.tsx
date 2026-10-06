import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants';

interface InboxPaginationProps {
  tab: string;
  sort: string;
  q: string;
  page: number;
  totalCount: number;
  totalPages: number;
  pageSize: number;
}

function pageHref(targetPage: number, tab: string, sort: string, q: string): string {
  const p = new URLSearchParams();
  p.set('tab', tab);
  if (sort !== 'newest') p.set('sort', sort);
  if (q) p.set('q', q);
  if (targetPage > 1) p.set('page', String(targetPage));
  return `${ROUTES.INBOX}?${p.toString()}`;
}

export function InboxPagination({
  tab,
  sort,
  q,
  page,
  totalCount,
  totalPages,
  pageSize,
}: InboxPaginationProps) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
  );

  const NAV_BASE =
    'inline-flex items-center justify-center h-7 px-2.5 rounded border text-2xs font-medium transition-colors';
  const NAV_ACTIVE = `${NAV_BASE} bg-primary text-primary-foreground border-primary`;
  const NAV_IDLE = `${NAV_BASE} bg-white text-foreground border-border hover:bg-background`;
  const NAV_DISABLED = `${NAV_BASE} bg-white text-muted border-border opacity-40 pointer-events-none`;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <span className="text-2xs text-muted">
        Mostrando {from}–{to} de {totalCount} solicitudes
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {page > 1 ? (
            <Link href={pageHref(page - 1, tab, sort, q)} className={NAV_IDLE}>
              <ChevronLeft size={13} />
              Anterior
            </Link>
          ) : (
            <span className={NAV_DISABLED}>
              <ChevronLeft size={13} />
              Anterior
            </span>
          )}

          {pageNumbers.map((n, i) => {
            const prev = pageNumbers[i - 1];
            const gap = prev !== undefined && n - prev > 1;
            return (
              <span key={n} className="flex items-center gap-1">
                {gap && <span className="text-2xs text-muted px-1">…</span>}
                <Link
                  href={pageHref(n, tab, sort, q)}
                  className={n === page ? NAV_ACTIVE : NAV_IDLE}
                >
                  {n}
                </Link>
              </span>
            );
          })}

          {page < totalPages ? (
            <Link href={pageHref(page + 1, tab, sort, q)} className={NAV_IDLE}>
              Siguiente
              <ChevronRight size={13} />
            </Link>
          ) : (
            <span className={NAV_DISABLED}>
              Siguiente
              <ChevronRight size={13} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
