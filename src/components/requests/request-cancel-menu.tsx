// Regla 3: 'use client' — useState para el menú desplegable y el diálogo, useTransition para la Server Action de cancelación.
'use client';

import { useRef, useState, useTransition } from 'react';
import { useDismissable } from '@/hooks/use-dismissable';
import { MoreHorizontal } from 'lucide-react';
import { cancelRequest } from '@/app/(dashboard)/requests/[id]/actions';
import { RequestActionDialog } from '@/components/requests/request-action-dialog';

interface RequestCancelMenuProps {
  requestId: string;
}

export function RequestCancelMenu({ requestId }: RequestCancelMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useDismissable({ open: menuOpen, onDismiss: () => setMenuOpen(false), containerRef: wrapperRef });

  function handleCancel(reason: string) {
    setError(null);
    startTransition(async () => {
      const result = await cancelRequest(requestId, reason);
      if (!result.ok) setError(result.error);
      else setDialogOpen(false);
    });
  }

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        className="grid place-items-center w-8 h-8 rounded-md text-muted hover:bg-border cursor-pointer"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label="Más opciones"
      >
        <MoreHorizontal size={18} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-40 bg-card border border-border rounded-lg shadow-md z-10 py-1">
          <button
            className="w-full px-4 py-2 text-left text-2xs text-danger hover:bg-danger-bg cursor-pointer"
            onClick={() => { setMenuOpen(false); setError(null); setDialogOpen(true); }}
          >
            Cancelar solicitud
          </button>
        </div>
      )}

      <RequestActionDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setError(null); }}
        title="¿Cancelar esta solicitud?"
        description="Esta acción no se puede deshacer. Podés agregar un motivo (opcional)."
        fieldLabel="Motivo (opcional)"
        required={false}
        confirmText="Cancelar solicitud"
        onConfirm={handleCancel}
        isPending={isPending}
        error={error}
        cancelLabel="Volver"
        destructive={true}
      />
    </div>
  );
}
