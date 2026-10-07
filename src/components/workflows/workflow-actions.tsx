'use client';
// Regla 3: 'use client' — useTransition para Server Actions, useState para diálogo
// de confirmación y errores inline.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Power } from 'lucide-react';
import { ROUTES } from '@/constants';
import { setWorkflowActive, duplicateWorkflow } from '@/app/(dashboard)/workflows/actions';
import { RequestActionDialog } from '@/components/requests/request-action-dialog';

interface WorkflowActionsProps {
  workflowId: string;
  workflowName: string;
  isActive: boolean;
  usedByTypeNames: string[];
}

const BTN_BASE =
  'flex items-center gap-2 px-3 py-1.5 rounded-md text-2xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export function WorkflowActions({
  workflowId,
  workflowName,
  isActive,
  usedByTypeNames,
}: WorkflowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleDuplicate() {
    setError(null);
    startTransition(async () => {
      const result = await duplicateWorkflow(workflowId);
      if (!result.ok) { setError(result.error); return; }
      router.push(`${ROUTES.WORKFLOWS}?id=${result.workflowId}`);
    });
  }

  function handleToggle() {
    if (isActive && usedByTypeNames.length > 0) {
      setDialogOpen(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setWorkflowActive(workflowId, !isActive);
      if (!result.ok) setError(result.error);
    });
  }

  function handleConfirmDeactivate(_comment: string) {
    setError(null);
    startTransition(async () => {
      const result = await setWorkflowActive(workflowId, false);
      if (!result.ok) { setError(result.error); return; }
      setDialogOpen(false);
    });
  }

  const typeList = usedByTypeNames.join(', ');

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {error && !dialogOpen && (
          <p role="alert" className="w-full text-2xs text-danger">{error}</p>
        )}
        <button
          className={`${BTN_BASE} border border-border text-muted hover:bg-surface`}
          onClick={handleDuplicate}
          disabled={isPending}
        >
          <Copy size={13} />
          {isPending ? 'Duplicando…' : 'Duplicar'}
        </button>
        <button
          className={`${BTN_BASE} ${
            isActive
              ? 'border border-border text-muted hover:bg-surface'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
          onClick={handleToggle}
          disabled={isPending}
        >
          <Power size={13} />
          {isActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      <RequestActionDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setError(null); }}
        title={`¿Desactivar "${workflowName}"?`}
        description={`Las nuevas solicitudes de los siguientes tipos no se podrán enviar mientras el workflow esté inactivo: ${typeList}.`}
        hideField={true}
        confirmText="Desactivar workflow"
        onConfirm={handleConfirmDeactivate}
        isPending={isPending}
        error={error}
        cancelLabel="Cancelar"
        destructive={true}
      />
    </>
  );
}
