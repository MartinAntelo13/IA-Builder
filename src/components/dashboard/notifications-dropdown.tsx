// Regla 3: 'use client' — maneja apertura, foco, click fuera y monta el fetcher al abrir.
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { transformInboxRow, type InboxRow } from '@/lib/transformers/inbox';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';

interface NotificationsDropdownProps {
  awaitingMyReview: number;
}

const PANEL_PAGE_SIZE = 5;

export function NotificationsDropdown({ awaitingMyReview }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierre con Escape (foco al botón) y click fuera.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [open]);

  const bellLabel =
    awaitingMyReview > 0
      ? `Solicitudes pendientes de revisión: ${awaitingMyReview}`
      : 'Solicitudes pendientes de revisión';

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={bellLabel}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="relative text-muted transition-colors hover:text-foreground cursor-pointer"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        {awaitingMyReview > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-2xs font-bold text-white">
            {awaitingMyReview}
          </span>
        )}
      </button>
      {open && (
        <NotificationsFetcher
          id={panelId}
          awaitingMyReview={awaitingMyReview}
          onNavigate={() => setOpen(false)}
        />
      )}
    </div>
  );
}

interface NotificationsFetcherProps {
  id: string;
  awaitingMyReview: number;
  onNavigate: () => void;
}

type FetchState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ok'; rows: InboxRow[] };

// Carga en CADA apertura: el fetcher monta fresco cuando open pasa a true y se
// desmonta al cerrar, por lo que no cachea entre aperturas. La bandera cancelled
// descarta respuestas tardías cuando el panel ya cerró.
function NotificationsFetcher({ id, awaitingMyReview, onNavigate }: NotificationsFetcherProps) {
  const [state, setState] = useState<FetchState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error: err } = await supabase.rpc('list_inbox', {
        p_tab: 'pending',
        p_sort: 'newest',
        p_page: 1,
        p_page_size: PANEL_PAGE_SIZE,
      });
      if (cancelled) return;
      if (err) {
        setState({ kind: 'error' });
        return;
      }
      setState({ kind: 'ok', rows: (data ?? []).map(transformInboxRow) });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <NotificationsPanel
      id={id}
      awaitingMyReview={awaitingMyReview}
      rows={state.kind === 'ok' ? state.rows : null}
      loading={state.kind === 'loading'}
      error={state.kind === 'error'}
      onNavigate={onNavigate}
    />
  );
}
