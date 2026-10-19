// Regla 3: 'use client' — se monta dentro del dropdown y recibe onNavigate (callback).
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { requestDetailHref } from '@/lib/routes';
import type { InboxRow } from '@/lib/transformers/inbox';
import { formatRelativeTime } from '@/lib/format-helpers';

interface NotificationsPanelProps {
  id: string;
  awaitingMyReview: number;
  rows: InboxRow[] | null;
  loading: boolean;
  error: boolean;
  onNavigate: () => void;
}

export function NotificationsPanel({
  id,
  awaitingMyReview,
  rows,
  loading,
  error,
  onNavigate,
}: NotificationsPanelProps) {
  const header = buildHeader(awaitingMyReview);
  const panelRef = useRef<HTMLDivElement>(null);

  // El panel solo monta cuando el dropdown está abierto: enfocar el wrapper al
  // montar lleva el foco al diálogo (sin trap: Tab natural recorre los links).
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label="Solicitudes pendientes de revisión"
      tabIndex={-1}
      className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-20 bg-card border border-border rounded-lg shadow-md flex flex-col outline-none"
    >
      {header && (
        <div className="px-3 py-2 text-2xs font-semibold text-foreground border-b border-border">
          {header}
        </div>
      )}
      <div className="max-h-80 overflow-y-auto">
        {loading && (
          <p className="px-3 py-6 text-center text-2xs text-muted">Cargando…</p>
        )}
        {!loading && error && (
          <p role="alert" className="px-3 py-6 text-center text-2xs text-danger">
            No se pudieron cargar las solicitudes.
          </p>
        )}
        {!loading && !error && rows && rows.length === 0 && (
          <p className="px-3 py-6 text-center text-2xs text-muted">
            No tenés solicitudes pendientes de revisión.
          </p>
        )}
        {!loading && !error && rows && rows.length > 0 && (
          <ul className="flex flex-col divide-y divide-border">
            {rows.map((row) => (
              <li key={row.requestId}>
                <NotificationsRow row={row} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border text-2xs">
        <Link
          href={ROUTES.INBOX}
          onClick={onNavigate}
          className="text-primary hover:underline"
        >
          Ver bandeja de entrada
        </Link>
        <Link
          href={ROUTES.REQUESTS}
          onClick={onNavigate}
          className="text-muted hover:underline"
        >
          Mis solicitudes
        </Link>
      </div>
    </div>
  );
}

function buildHeader(n: number): string | null {
  if (n <= 0) return null;
  return n === 1
    ? 'Tenés 1 solicitud pendiente de revisión'
    : `Tenés ${n} solicitudes pendientes de revisión`;
}

interface NotificationsRowProps {
  row: InboxRow;
  onNavigate: () => void;
}

function NotificationsRow({ row, onNavigate }: NotificationsRowProps) {
  const href = requestDetailHref(row.requestId, { from: 'inbox' });
  const time = formatRelativeTime(row.stepActivatedAt);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block px-3 py-2 hover:bg-surface"
    >
      <p className="text-2xs font-semibold text-foreground truncate">{row.title}</p>
      <p className="mt-0.5 text-2xs text-muted truncate">
        {row.code} · {row.requesterName}
        {time && time !== '—' ? ` · ${time}` : ''}
      </p>
    </Link>
  );
}
