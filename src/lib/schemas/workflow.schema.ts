import { z } from 'zod';

export const APPROVER_TYPES = ['requester_manager', 'role', 'user'] as const;
export type WorkflowApproverType = (typeof APPROVER_TYPES)[number];

// stepId: uuid existente | null (paso nuevo). Se renombra desde "id" para evitar
// colisión con el campo "id" que useFieldArray agrega para el key de React.
const stepSchema = z
  .object({
    stepId: z.string().uuid().nullable(),
    label: z.string().trim().min(1, 'El nombre del paso es obligatorio'),
    approverType: z.enum(APPROVER_TYPES),
    roleId: z.string().nullable(),
    userId: z.string().nullable(),
  })
  .superRefine((step, ctx) => {
    if (step.approverType === 'role' && !step.roleId) {
      ctx.addIssue({ code: 'custom', path: ['roleId'], message: 'Elegí un rol' });
    }
    if (step.approverType === 'user' && !step.userId) {
      ctx.addIssue({ code: 'custom', path: ['userId'], message: 'Elegí un usuario' });
    }
  });

export function buildWorkflowSchema(isActive: boolean) {
  const stepsBase = z.array(stepSchema);
  const steps = isActive
    ? stepsBase.min(1, 'Un workflow activo debe tener al menos un paso')
    : stepsBase;
  return z.object({
    name: z.string().trim().min(1, 'El nombre es obligatorio'),
    description: z.string(),
    steps,
  });
}

export type WorkflowFormValues = z.infer<ReturnType<typeof buildWorkflowSchema>>;
export type WorkflowStepFormValue = WorkflowFormValues['steps'][number];
