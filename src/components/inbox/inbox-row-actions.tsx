'use client';
// Regla 3: 'use client' — useState/useTransition para el diálogo de confirmación
// y la Server Action approveRequest; el servidor no puede manejar eventos de click.

import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { approveRequest } from '@/app/(dashboard)/requests/[id]/actions';
import { RequestActionDialog } from '@/components/requests/request-action-dialog';

interface InboxRowActionsProps {
  requestId: string;
  code: string;
  title: string;
}

export function InboxRowActions({ requestId, code, title }: InboxRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setError(null);
  }

  // _comment ignorado: approveRequest no acepta comentario
  function handleConfirm(_comment: string) {
    setError(null);
    startTransition(async () => {
      const result = await approveRequest(requestId);
      if (!result.ok) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={isPending}
        aria-label={`Aprobar ${code}`}
        className="h-9 w-9 grid place-items-center rounded-md border border-border text-muted hover:bg-success-bg hover:text-success transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        <Check size={15} />
      </button>

      <RequestActionDialog
        open={open}
        onClose={handleClose}
        title="Aprobar solicitud"
        description={`¿Aprobar "${title}" (${code})? Esta acción no se puede deshacer.`}
        hideField={true}
        confirmText="Aprobar"
        onConfirm={handleConfirm}
        isPending={isPending}
        error={error}
      />
    </>
  );
}
