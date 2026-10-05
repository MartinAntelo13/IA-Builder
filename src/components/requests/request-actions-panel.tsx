'use client';
// Client Component: uses useState for dialog open states and useTransition for server action loading

import { useState, useTransition } from 'react';
import { Check, XCircle, RotateCcw, ShieldCheck, Info } from 'lucide-react';
import { approveRequest, requestChanges, resubmitRequest } from '@/app/(dashboard)/requests/[id]/actions';
import { RequestActionDialog } from '@/components/requests/request-action-dialog';

interface RequestActionsPanelProps {
  requestId: string;
  canDecide: boolean;
  canResubmit: boolean;
}

const CARD = 'bg-white border border-border rounded-lg shadow-sm px-6 py-5 max-md:px-4 max-md:py-4';
const SIDE_TITLE = 'flex items-center justify-between gap-2 pb-4 mb-4 border-b border-border';
const BTN_PRIMARY =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md bg-primary text-primary-foreground text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';
const BTN_SECONDARY =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md border border-border text-muted text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export function RequestActionsPanel({ requestId, canDecide, canResubmit }: RequestActionsPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [changesOpen, setChangesOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canDecide && !canResubmit) return null;

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveRequest(requestId);
      if (!result.ok) setError(result.error);
    });
  }

  function handleChanges(comment: string) {
    setError(null);
    startTransition(async () => {
      const result = await requestChanges(requestId, comment);
      if (!result.ok) setError(result.error);
      else setChangesOpen(false);
    });
  }

  function handleResubmit(comment: string) {
    setError(null);
    startTransition(async () => {
      const result = await resubmitRequest(requestId, comment);
      if (!result.ok) setError(result.error);
      else setResubmitOpen(false);
    });
  }

  return (
    <>
      <article className={CARD}>
        <div className={SIDE_TITLE}>
          <h2 className="m-0 text-foreground text-sm tracking-tight">Acciones</h2>
          <ShieldCheck size={15} className="text-muted shrink-0" />
        </div>

        {error && (
          <div role="alert" className="mb-3 p-2.5 bg-danger-bg rounded text-2xs text-danger">
            {error}
          </div>
        )}

        {canDecide && (
          <>
            <div className="flex items-start gap-2 p-3 mb-3 bg-warning-bg rounded-md text-2xs text-warning">
              <Info size={14} className="shrink-0 mt-px" />
              <span>Esta solicitud requiere tu aprobación para continuar.</span>
            </div>
            <div className="flex flex-col gap-2">
              <button className={BTN_PRIMARY} onClick={handleApprove} disabled={isPending}>
                <Check size={14} />
                {isPending ? 'Aprobando…' : 'Aprobar solicitud'}
              </button>
              <button
                className={BTN_SECONDARY}
                onClick={() => { setError(null); setChangesOpen(true); }}
                disabled={isPending}
              >
                <XCircle size={14} />
                Solicitar cambios
              </button>
            </div>
            <p className="mt-3 m-0 text-2xs text-muted text-center">
              Al aprobar, la solicitud pasará al siguiente nivel del flujo.
            </p>
          </>
        )}

        {canResubmit && (
          <>
            <div className="flex items-start gap-2 p-3 mb-3 bg-warning-bg rounded-md text-2xs text-warning">
              <Info size={14} className="shrink-0 mt-px" />
              <span>Se solicitaron cambios sobre esta solicitud.</span>
            </div>
            <button
              className={BTN_PRIMARY}
              onClick={() => { setError(null); setResubmitOpen(true); }}
              disabled={isPending}
            >
              <RotateCcw size={14} />
              {isPending ? 'Enviando…' : 'Reenviar solicitud'}
            </button>
          </>
        )}
      </article>

      <RequestActionDialog
        open={changesOpen}
        onClose={() => { setChangesOpen(false); setError(null); }}
        title="Solicitar cambios"
        description="Indicá qué cambios necesita la solicitud antes de continuar."
        fieldLabel="Comentario"
        required={true}
        confirmText="Solicitar cambios"
        onConfirm={handleChanges}
        isPending={isPending}
        error={error}
      />

      <RequestActionDialog
        open={resubmitOpen}
        onClose={() => { setResubmitOpen(false); setError(null); }}
        title="Reenviar solicitud"
        description="Podés agregar una nota con los cambios realizados."
        fieldLabel="Nota (opcional)"
        required={false}
        confirmText="Reenviar solicitud"
        onConfirm={handleResubmit}
        isPending={isPending}
        error={error}
      />
    </>
  );
}
