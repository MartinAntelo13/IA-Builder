'use client';
// Regla 3: 'use client' — useState para menuOpen/dialog, useTransition para acciones.

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Workflow, MoreHorizontal } from 'lucide-react';
import { ROUTES } from '@/constants';
import { setWorkflowActive } from '@/app/(dashboard)/workflows/actions';
import { RequestActionDialog } from '@/components/requests/request-action-dialog';
import type { WorkflowItem } from '@/lib/transformers/workflows';

interface WorkflowListProps {
  workflows: WorkflowItem[];
  selectedId: string | null;
  usedByMap: Record<string, string[]>;
}

const CARD = 'bg-white border border-border rounded-lg shadow-sm overflow-hidden';
const BADGE_ACTIVE = 'inline-flex px-1.5 py-0.5 rounded text-2xs font-medium bg-success-bg text-success';
const BADGE_INACTIVE = 'inline-flex px-1.5 py-0.5 rounded text-2xs font-medium bg-border text-muted';

export function WorkflowList({ workflows, selectedId, usedByMap }: WorkflowListProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogWorkflow, setDialogWorkflow] = useState<WorkflowItem | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(null);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  function handleToggle(wf: WorkflowItem) {
    setMenuOpen(null);
    if (wf.isActive && (usedByMap[wf.id] ?? []).length > 0) {
      setDialogWorkflow(wf);
      return;
    }
    setError(null);
    setPendingId(wf.id);
    startTransition(async () => {
      const result = await setWorkflowActive(wf.id, !wf.isActive);
      if (!result.ok) setError(result.error);
      setPendingId(null);
    });
  }

  function handleConfirmDeactivate(_comment: string) {
    if (!dialogWorkflow) return;
    setError(null);
    setPendingId(dialogWorkflow.id);
    startTransition(async () => {
      const result = await setWorkflowActive(dialogWorkflow.id, false);
      if (!result.ok) { setError(result.error); return; }
      setDialogWorkflow(null);
      setPendingId(null);
    });
  }

  return (
    <>
      <div className={CARD}>
        <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Workflows configurados</h2>
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary/10 text-primary text-2xs font-bold">
            {workflows.length}
          </span>
        </div>

        {error && (
          <p role="alert" className="px-4 py-2 text-2xs text-danger bg-danger-bg">{error}</p>
        )}

        {workflows.length === 0 && (
          <p className="px-4 py-6 text-2xs text-muted text-center">
            No hay workflows configurados.
          </p>
        )}

        {workflows.map((wf) => {
          const isSelected = wf.id === selectedId;
          const isMenuOpen = menuOpen === wf.id;
          const isThisPending = pendingId === wf.id && isPending;

          return (
            <div
              key={wf.id}
              className={`relative px-4 py-4 border-b border-border last:border-b-0 transition-colors ${
                isSelected ? 'border-l-2 border-l-primary bg-surface' : 'border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                  <Workflow size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`${ROUTES.WORKFLOWS}?id=${wf.id}`}
                    className="text-xs font-semibold text-foreground truncate block after:absolute after:inset-0"
                  >
                    {wf.name}
                  </Link>
                  {wf.description && (
                    <p className="mt-0.5 text-2xs text-muted line-clamp-1">{wf.description}</p>
                  )}
                  <p className="mt-1 text-2xs text-muted">
                    {wf.stepCount} {wf.stepCount === 1 ? 'paso' : 'pasos'} · {wf.updatedAt}
                  </p>
                  <span className={`${wf.isActive ? BADGE_ACTIVE : BADGE_INACTIVE}${isThisPending ? ' opacity-50' : ''}`}>
                    {isThisPending ? '…' : wf.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="relative z-10 shrink-0" ref={isMenuOpen ? menuRef : undefined}>
                  <button
                    className="grid place-items-center w-7 h-7 rounded-md text-muted hover:bg-border cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(isMenuOpen ? null : wf.id); }}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                    aria-label={`Opciones de ${wf.name}`}
                    disabled={isPending}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 min-w-36 bg-white border border-border rounded-lg shadow-md z-20 py-1">
                      <button
                        className="w-full px-4 py-2 text-left text-2xs text-foreground hover:bg-surface cursor-pointer"
                        onClick={() => handleToggle(wf)}
                      >
                        {wf.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {dialogWorkflow && (
        <RequestActionDialog
          open={!!dialogWorkflow}
          onClose={() => { setDialogWorkflow(null); setError(null); }}
          title={`¿Desactivar "${dialogWorkflow.name}"?`}
          description={`Las nuevas solicitudes de los siguientes tipos no se podrán enviar mientras el workflow esté inactivo: ${(usedByMap[dialogWorkflow.id] ?? []).join(', ')}.`}
          hideField={true}
          confirmText="Desactivar workflow"
          onConfirm={handleConfirmDeactivate}
          isPending={isPending}
          error={error}
          cancelLabel="Cancelar"
          destructive={true}
        />
      )}
    </>
  );
}
