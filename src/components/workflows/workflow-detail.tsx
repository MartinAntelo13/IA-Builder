import { ShieldCheck } from 'lucide-react';
import { WorkflowActions } from '@/components/workflows/workflow-actions';
import type { WorkflowItem, WorkflowStep } from '@/lib/transformers/workflows';

interface UsedByType {
  id: string;
  name: string;
}

interface WorkflowDetailProps {
  workflow: WorkflowItem;
  steps: WorkflowStep[];
  usedByTypes: UsedByType[];
}

const CARD = 'bg-white border border-border rounded-lg shadow-sm px-6 py-5 max-md:px-4';

const STEP_PILL = 'bg-primary/10 text-primary';

export function WorkflowDetail({ workflow, steps, usedByTypes }: WorkflowDetailProps) {
  const usedByTypeNames = usedByTypes.map((t) => t.name);

  return (
    <article className={CARD}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-2xs font-bold tracking-wider text-muted uppercase mb-1">
            DETALLE DEL WORKFLOW
          </p>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">{workflow.name}</h2>
          {workflow.description && (
            <p className="mt-1 text-2xs text-muted">{workflow.description}</p>
          )}
        </div>
        <div className="shrink-0">
          <WorkflowActions
            workflowId={workflow.id}
            workflowName={workflow.name}
            isActive={workflow.isActive}
            usedByTypeNames={usedByTypeNames}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-6 pt-5 border-t border-border">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Pasos de aprobación</h3>
          <p className="text-2xs text-muted mt-0.5">Se ejecutan en orden, de arriba hacia abajo.</p>
        </div>
        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary/10 text-primary text-2xs font-bold">
          {steps.length}
        </span>
      </div>

      {steps.length === 0 && (
        <p className="mt-4 text-2xs text-muted">Este workflow no tiene pasos de aprobación.</p>
      )}

      <ol className="mt-3 flex flex-col gap-3">
        {steps.map((step) => (
            <li key={step.id} className="flex gap-3 p-3 bg-surface border border-border rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-2xs font-bold grid place-items-center shrink-0 mt-0.5">
                {step.position}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{step.label}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-2xs font-medium px-1.5 py-0.5 rounded ${STEP_PILL}`}>
                    {step.approverTypeLabel}
                  </span>
                  {step.responsibleName && (
                    <span className="text-2xs text-muted">{step.responsibleName}</span>
                  )}
                </div>
                {step.slaHours != null && (
                  <p className="mt-1 text-2xs text-muted">SLA: {step.slaHours} {step.slaHours === 1 ? 'hora' : 'horas'}</p>
                )}
              </div>
            </li>
        ))}
      </ol>

      {usedByTypes.length > 0 && (
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-2xs font-semibold text-muted mb-2">Usado por</p>
          <div className="flex flex-wrap gap-2">
            {usedByTypes.map((t) => (
              <span key={t.id} className="px-2 py-1 rounded-md bg-surface border border-border text-2xs text-foreground">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 mt-5 p-3 bg-primary/10 rounded-md">
        <ShieldCheck size={14} className="text-primary shrink-0 mt-px" />
        <p className="text-2xs text-muted">
          Los cambios se aplicarán a las nuevas solicitudes. Las solicitudes en curso mantienen su flujo actual.
        </p>
      </div>
    </article>
  );
}
