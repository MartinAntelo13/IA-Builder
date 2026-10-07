import type { Database } from '@/types/database.types';
import { formatRelativeTime } from '@/lib/format-helpers';

type ApproverType = Database['public']['Enums']['approver_type'];

// Derived from workflows Row + embedded count aggregate (Regla 7)
export type WorkflowFromQuery = Pick<
  Database['public']['Tables']['workflows']['Row'],
  'id' | 'name' | 'description' | 'is_active' | 'updated_at'
> & { workflow_steps: Array<{ count: number }> | null };

export function transformWorkflow(row: WorkflowFromQuery) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    updatedAt: formatRelativeTime(row.updated_at),
    stepCount: (row.workflow_steps as Array<{ count: number }> | null)?.[0]?.count ?? 0,
  };
}

export type WorkflowItem = ReturnType<typeof transformWorkflow>;

// Derived from workflow_steps Row (Regla 7)
export type WorkflowStepFromQuery = Pick<
  Database['public']['Tables']['workflow_steps']['Row'],
  'id' | 'position' | 'label' | 'approver_type' | 'role_id' | 'user_id' | 'sla_hours'
>;

const APPROVER_TYPE_LABELS: Record<ApproverType, string> = {
  requester_manager: 'Responsable del solicitante',
  role: 'Rol',
  user: 'Usuario',
};

export function transformWorkflowStep(
  row: WorkflowStepFromQuery,
  roleNames: Record<string, string>,
  userNames: Record<string, string>,
) {
  const approverTypeLabel = APPROVER_TYPE_LABELS[row.approver_type];
  const responsibleName =
    row.approver_type === 'requester_manager'
      ? null
      : row.approver_type === 'role'
        ? (row.role_id ? (roleNames[row.role_id] ?? 'Rol no encontrado') : null)
        : (row.user_id ? (userNames[row.user_id] ?? 'Usuario no encontrado') : null);

  return {
    id: row.id,
    position: row.position,
    label: row.label,
    approverType: row.approver_type,
    approverTypeLabel,
    responsibleName,
    slaHours: row.sla_hours,
  };
}

export type WorkflowStep = ReturnType<typeof transformWorkflowStep>;
