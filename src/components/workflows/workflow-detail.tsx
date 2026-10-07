import { ShieldCheck } from 'lucide-react';
import { WorkflowActions } from '@/components/workflows/workflow-actions';
import { WorkflowEditor } from '@/components/workflows/workflow-editor';
import type { WorkflowStepOption } from '@/components/workflows/workflow-step-card';
import type { WorkflowItem, WorkflowStep } from '@/lib/transformers/workflows';

interface UsedByType {
  id: string;
  name: string;
}

interface WorkflowDetailProps {
  workflow: WorkflowItem;
  steps: WorkflowStep[];
  usedByTypes: UsedByType[];
  roleOptions: WorkflowStepOption[];
  userOptions: WorkflowStepOption[];
  roleIdsWithActiveUsers: string[];
}

const CARD = 'bg-white border border-border rounded-lg shadow-sm px-6 py-5 max-md:px-4';

export function WorkflowDetail({
  workflow,
  steps,
  usedByTypes,
  roleOptions,
  userOptions,
  roleIdsWithActiveUsers,
}: WorkflowDetailProps) {
  const usedByTypeNames = usedByTypes.map((t) => t.name);

  return (
    <article className={CARD}>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <p className="text-2xs font-bold tracking-wider text-muted uppercase">
          DETALLE DEL WORKFLOW
        </p>
        <div className="shrink-0">
          <WorkflowActions
            workflowId={workflow.id}
            workflowName={workflow.name}
            isActive={workflow.isActive}
            usedByTypeNames={usedByTypeNames}
          />
        </div>
      </div>

      <WorkflowEditor
        key={`${workflow.id}:${workflow.updatedAtRaw}`}
        workflow={workflow}
        steps={steps}
        roleOptions={roleOptions}
        userOptions={userOptions}
        roleIdsWithActiveUsers={roleIdsWithActiveUsers}
      />

      {usedByTypes.length > 0 && (
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-2xs font-semibold text-muted mb-2">Usado por</p>
          <div className="flex flex-wrap gap-2">
            {usedByTypes.map((t) => (
              <span
                key={t.id}
                className="px-2 py-1 rounded-md bg-surface border border-border text-2xs text-foreground"
              >
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
