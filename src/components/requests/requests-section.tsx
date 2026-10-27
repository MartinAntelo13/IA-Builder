import Link from 'next/link';
import { FileText } from 'lucide-react';
import { REQUEST_STATUS_STYLES, ROUTES, DASHBOARD_REQUESTS_PAGE_SIZE } from '@/constants';
import { requestDetailHref, requestsListHref } from '@/lib/routes';
import { formatAmountOrFree, formatRelativeTime } from '@/lib/format-helpers';
import type { RequestRow } from '@/lib/transformers/requests';
import { RequestRowItem } from '@/components/requests/request-row';
import { RequestsSearch } from '@/components/requests/requests-search';

interface RequestsSectionProps {
  requests: RequestRow[];
  variant?: 'dashboard' | 'list';
  // Valor actual de la búsqueda guiada por URL; sólo aplica a variant="list".
  q?: string;
  // Alcance activo; sólo aplica a variant="list".
  scope?: 'all';
  // Estado activo (?status=) en variant="dashboard"; null = pestaña "Todas".
  status?: string | null;
}

const STATUS_TABS = [
  { value: null as string | null, label: 'Todas' },
  { value: 'submitted', label: 'Enviadas' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'changes_requested', label: 'Cambios solicitados' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
];

// Href de una pestaña del Resumen: conserva la búsqueda (q) y resetea el estado.
function dashboardTabHref(status: string | null, q: string): string {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  const qs = params.toString();
  return qs ? `${ROUTES.DASHBOARD}?${qs}` : ROUTES.DASHBOARD;
}

function StatusBadge({ status }: { status: string }) {
  const style = REQUEST_STATUS_STYLES[status];
  if (!style) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-2xs font-bold whitespace-nowrap ring-1 ring-inset ${style.badge}`}
    >
      {style.label}
    </span>
  );
}

export function RequestsSection({ requests, variant = 'list', q = '', scope, status = null }: RequestsSectionProps) {
  const isDashboard = variant === 'dashboard';
  const rows = requests;

  return (
    <div className="overflow-hidden bg-card border border-border rounded-lg shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-foreground">Solicitudes recientes</h2>
        {isDashboard && (
          <p className="mt-0.5 text-2xs text-muted">
            Gestiona y da seguimiento a las solicitudes de tu equipo.{' '}
            Se muestran las {DASHBOARD_REQUESTS_PAGE_SIZE} más recientes.
          </p>
        )}
      </div>

      <div className="px-4 pb-3 border-b border-border flex flex-wrap items-center gap-2.5">
        {isDashboard ? (
          <RequestsSearch q={q} action={ROUTES.DASHBOARD} status={status ?? undefined} />
        ) : (
          <RequestsSearch q={q} scope={scope} />
        )}

        {isDashboard && (
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => {
              const active = status === tab.value;
              return (
                <Link
                  key={tab.value ?? 'all'}
                  href={dashboardTabHref(tab.value, q)}
                  aria-current={active ? 'page' : undefined}
                  className={`text-2xs px-2.5 py-2 rounded-md transition-colors ${
                    active
                      ? 'text-primary bg-primary/10 font-bold'
                      : 'text-muted bg-transparent hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {rows.length > 0 ? (
        <div>
          {rows.map((row) => (
            <RequestRowItem
              key={row.id}
              code={row.code}
              title={row.title}
              detailHref={requestDetailHref(row.id)}
              requesterName={row.requesterName}
              timeStr={formatRelativeTime(row.submittedAt)}
              amountStr={formatAmountOrFree(row.amount, row.currencySymbol)}
              badge={<StatusBadge status={row.status} />}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <FileText size={36} className="text-muted mb-3" />
          {!isDashboard && q ? (
            <>
              <p className="text-xs text-muted">
                No se encontraron solicitudes para «{q}».
              </p>
              <Link
                href={requestsListHref({ scope })}
                className="mt-3 text-2xs font-medium text-primary hover:underline"
              >
                Limpiar búsqueda
              </Link>
            </>
          ) : (
            <p className="text-xs text-muted">
              No hay solicitudes que coincidan con los filtros.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
