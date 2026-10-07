'use client';
// Regla 3: 'use client' — usa hooks de react-hook-form (useWatch) para
// re-renderizar los selects contextuales según el tipo de aprobador elegido.

import { useWatch, type UseFormReturn } from 'react-hook-form';
import { ArrowUp, ArrowDown, Trash2, AlertCircle } from 'lucide-react';
import type { WorkflowFormValues } from '@/lib/schemas/workflow.schema';

export interface WorkflowStepOption {
  id: string;
  name: string;
}

interface WorkflowStepCardProps {
  index: number;
  form: UseFormReturn<WorkflowFormValues>;
  roleOptions: WorkflowStepOption[];
  userOptions: WorkflowStepOption[];
  roleIdsWithActiveUsers: Set<string>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

const APPROVER_TYPE_OPTIONS = [
  { value: 'requester_manager', label: 'Responsable del solicitante' },
  { value: 'role', label: 'Rol' },
  { value: 'user', label: 'Usuario específico' },
] as const;

const INPUT =
  'w-full px-3 py-2 rounded-md border border-border bg-white text-xs text-foreground';
const ICON_BTN =
  'grid place-items-center w-7 h-7 rounded-md text-muted hover:bg-border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

export function WorkflowStepCard({
  index,
  form,
  roleOptions,
  userOptions,
  roleIdsWithActiveUsers,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: WorkflowStepCardProps) {
  const { register, control, setValue, formState: { errors } } = form;

  const approverType = useWatch({ control, name: `steps.${index}.approverType` });
  const selectedRoleId = useWatch({ control, name: `steps.${index}.roleId` });

  const stepErrors = errors.steps?.[index];

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as (typeof APPROVER_TYPE_OPTIONS)[number]['value'];
    setValue(`steps.${index}.approverType`, next, { shouldDirty: true, shouldValidate: true });
    if (next !== 'role') setValue(`steps.${index}.roleId`, null, { shouldDirty: true });
    if (next !== 'user') setValue(`steps.${index}.userId`, null, { shouldDirty: true });
  }

  const showRoleWarning =
    approverType === 'role' && !!selectedRoleId && !roleIdsWithActiveUsers.has(selectedRoleId);

  return (
    <div className="flex gap-3 p-3 bg-surface border border-border rounded-lg">
      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-2xs font-bold grid place-items-center shrink-0 mt-0.5">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div>
          <label htmlFor={`step-${index}-label`} className="block text-2xs font-semibold text-muted mb-1">
            Nombre del paso
          </label>
          <input
            id={`step-${index}-label`}
            type="text"
            {...register(`steps.${index}.label`)}
            className={INPUT}
            placeholder="Ej. Aprobación del responsable"
          />
          {stepErrors?.label && (
            <p role="alert" className="mt-1 text-2xs text-danger">{stepErrors.label.message}</p>
          )}
        </div>

        <div>
          <label htmlFor={`step-${index}-type`} className="block text-2xs font-semibold text-muted mb-1">
            Tipo de aprobador
          </label>
          <select
            id={`step-${index}-type`}
            value={approverType}
            onChange={handleTypeChange}
            className={INPUT}
          >
            {APPROVER_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {approverType === 'role' && (
          <div>
            <label htmlFor={`step-${index}-role`} className="block text-2xs font-semibold text-muted mb-1">
              Rol
            </label>
            <select
              id={`step-${index}-role`}
              {...register(`steps.${index}.roleId`)}
              className={INPUT}
            >
              <option value="">Seleccioná un rol</option>
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {stepErrors?.roleId && (
              <p role="alert" className="mt-1 text-2xs text-danger">{stepErrors.roleId.message}</p>
            )}
            {showRoleWarning && (
              <div className="mt-2 flex items-start gap-2 p-2 bg-warning-bg rounded-md">
                <AlertCircle size={13} className="text-warning shrink-0 mt-px" />
                <p className="text-2xs text-warning">Ningún usuario activo tiene este rol.</p>
              </div>
            )}
          </div>
        )}

        {approverType === 'user' && (
          <div>
            <label htmlFor={`step-${index}-user`} className="block text-2xs font-semibold text-muted mb-1">
              Usuario
            </label>
            <select
              id={`step-${index}-user`}
              {...register(`steps.${index}.userId`)}
              className={INPUT}
            >
              <option value="">Seleccioná un usuario</option>
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            {stepErrors?.userId && (
              <p role="alert" className="mt-1 text-2xs text-danger">{stepErrors.userId.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label="Subir paso"
          className={ICON_BTN}
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label="Bajar paso"
          className={ICON_BTN}
        >
          <ArrowDown size={13} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Eliminar paso"
          className="grid place-items-center w-7 h-7 rounded-md text-danger hover:bg-danger-bg cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
