'use client';
// Client Component: uses useState for dialog open state and useTransition for reject action

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { BTN_DANGER } from '@/lib/ui/form-classes';
import { rejectRequest } from '@/app/(dashboard)/requests/[id]/actions';
import { RequestActionDialog } from '@/components/requests/request-action-dialog';

interface RejectRequestButtonProps {
  requestId: string;
}

export function RejectRequestButton({ requestId }: RejectRequestButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReject(comment: string) {
    setError(null);
    startTransition(async () => {
      const result = await rejectRequest(requestId, comment);
      if (!result.ok) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <>
      <button
        className={`w-full ${BTN_DANGER}`}
        onClick={() => { setError(null); setOpen(true); }}
        disabled={isPending}
      >
        <X size={14} />
        {isPending ? 'Rechazando…' : 'Rechazar solicitud'}
      </button>

      <RequestActionDialog
        open={open}
        onClose={() => { setOpen(false); setError(null); }}
        title="Rechazar solicitud"
        description="Esta acción no se puede deshacer. El solicitante será notificado."
        fieldLabel="Motivo del rechazo"
        required={true}
        confirmText="Rechazar solicitud"
        onConfirm={handleReject}
        isPending={isPending}
        error={error}
        destructive={true}
      />
    </>
  );
}
