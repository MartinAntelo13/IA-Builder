'use client';
// Regla 3: 'use client' — react-hook-form + useFieldArray + useTransition para
// disparar la Server Action saveWorkflow y manejar feedback inline.

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save } from 'lucide-react';
import { saveWorkflow } from '@/app/(dashboard)/workflows/actions';
import {
  buildWorkflowSchema,
  type WorkflowFormValues,
} from '@/lib/schemas/workflow.schema';
import { WorkflowStepCard, type WorkflowStepOption } from '@/components/workflows/workflow-step-card';
import type { WorkflowItem, WorkflowStep } from '@/lib/transformers/workflows';

interface WorkflowEditorProps {
  workflow: WorkflowItem;
  steps: WorkflowStep[];
  roleOptions: WorkflowStepOption[];
  userOptions: WorkflowStepOption[];
  roleIdsWithActiveUsers: string[];
}

const INPUT =
  'w-full px-3 py-2 rounded-md border border-border bg-white text-xs text-foreground';

export function WorkflowEditor({
  workflow,
  steps,
  roleOptions,
  userOptions,
  roleIdsWithActiveUsers,
}: WorkflowEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const schema = useMemo(() => buildWorkflowSchema(workflow.isActive), [workflow.isActive]);
  const activeRoleIdSet = useMemo(() => new Set(roleIdsWithActiveUsers), [roleIdsWithActiveUsers]);

  const defaultValues: WorkflowFormValues = useMemo(
    () => ({
      name: workflow.name,
      description: workflow.description ?? '',
      steps: steps.map((s) => ({
        stepId: s.id,
        label: s.label,
        approverType: s.approverType,
        roleId: s.roleId,
        userId: s.userId,
      })),
    }),
    [workflow.name, workflow.description, steps],
  );

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });
  const { register, handleSubmit, control, formState: { errors, isDirty } } = form;
  const { fields, append, remove, move } = useFieldArray({ control, name: 'steps' });

  function onSubmit(values: WorkflowFormValues) {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await saveWorkflow(workflow.id, values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      form.reset(values);
      setSuccess(true);
      router.refresh();
    });
  }

  const stepsError = typeof errors.steps?.message === 'string' ? errors.steps.message : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="wf-name" className="block text-2xs font-semibold text-foreground mb-1">
          Nombre
        </label>
        <input id="wf-name" type="text" {...register('name')} className={INPUT} />
        {errors.name && (
          <p role="alert" className="mt-1 text-2xs text-danger">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="wf-desc" className="block text-2xs font-semibold text-foreground mb-1">
          Descripción
        </label>
        <textarea id="wf-desc" rows={3} {...register('description')} className={INPUT} />
        {errors.description && (
          <p role="alert" className="mt-1 text-2xs text-danger">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-5 border-t border-border">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Pasos de aprobación</h3>
          <p className="text-2xs text-muted mt-0.5">Se ejecutan en orden, de arriba hacia abajo.</p>
        </div>
        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary/10 text-primary text-2xs font-bold">
          {fields.length}
        </span>
      </div>

      {stepsError && <p role="alert" className="text-2xs text-danger">{stepsError}</p>}

      {fields.length === 0 && (
        <p className="text-2xs text-muted">Este workflow no tiene pasos de aprobación.</p>
      )}

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <WorkflowStepCard
            key={field.id}
            index={index}
            form={form}
            roleOptions={roleOptions}
            userOptions={userOptions}
            roleIdsWithActiveUsers={activeRoleIdSet}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          append({
            stepId: null,
            label: '',
            approverType: 'requester_manager',
            roleId: null,
            userId: null,
          })
        }
        className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-2xs text-muted hover:bg-surface cursor-pointer"
      >
        <Plus size={13} />
        Agregar paso
      </button>

      {serverError && <p role="alert" className="text-2xs text-danger">{serverError}</p>}
      {success && !serverError && (
        <p role="status" className="text-2xs text-success">Workflow guardado.</p>
      )}

      <div className="flex justify-end pt-5 border-t border-border">
        <button
          type="submit"
          disabled={!isDirty || isPending}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-2xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <Save size={13} />
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
