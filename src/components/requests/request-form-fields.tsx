'use client';
// Client Component: shared form fields entre new y edit; usa useWatch del form del padre

import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { RequestFormValues } from '@/lib/validations/request.schema';
import type { Database } from '@/types/database.types';

type RequestType = Pick<
  Database['public']['Tables']['request_types']['Row'],
  'id' | 'name' | 'requires_amount'
>;
type CostCenter = Pick<
  Database['public']['Tables']['cost_centers']['Row'],
  'id' | 'name' | 'code'
>;

interface RequestFormFieldsProps {
  form: UseFormReturn<RequestFormValues>;
  requestTypes: RequestType[];
  costCenters: CostCenter[];
  currencySymbol: string;
  requiresAmount: boolean;
  onRequiresAmountChange: (requires: boolean) => void;
  // En estado 'changes_requested' el trigger requests_guard_update bloquea el
  // cambio de request_type_id. El select se renderiza sin register, con el valor
  // en defaultValues, para que handleSubmit lo entregue intacto.
  typeFieldLocked?: boolean;
  lockedTypeName?: string | null;
}

const PRIORITIES = [
  { value: 'low', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
] as const;

export function RequestFormFields({
  form,
  requestTypes,
  costCenters,
  currencySymbol,
  requiresAmount,
  onRequiresAmountChange,
  typeFieldLocked = false,
  lockedTypeName = null,
}: RequestFormFieldsProps) {
  const { register, setValue, getValues, control, formState: { errors } } = form;
  const priority = useWatch({ control, name: 'priority' }) ?? 'normal';
  // register solo cuando el tipo es editable; en locked no se registra y el
  // valor para handleSubmit sale del defaultValues del useForm padre.
  const typeField = typeFieldLocked ? null : register('request_type_id');

  return (
    <>
      <div className="field">
        <label htmlFor="req-type">Tipo de solicitud</label>
        {typeField === null ? (
          <>
            <select id="req-type" defaultValue={getValues('request_type_id')} disabled>
              <option value={getValues('request_type_id')}>{lockedTypeName ?? '—'}</option>
            </select>
            <small className="mt-1 text-2xs text-muted">No se puede cambiar el tipo en este estado.</small>
          </>
        ) : (
          <select
            id="req-type"
            {...typeField}
            onChange={(e) => {
              typeField.onChange(e);
              const type = requestTypes.find((t) => t.id === e.target.value);
              onRequiresAmountChange(type?.requires_amount ?? false);
              if (!type?.requires_amount) setValue('amount', null);
            }}
          >
            <option value="">Seleccioná un tipo</option>
            {requestTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        {errors.request_type_id && <span className="field-error">{errors.request_type_id.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="req-title">Título</label>
        <input id="req-title" type="text" {...register('title')} placeholder="Ej. Compra de licencias Figma" />
        {errors.title && <span className="field-error">{errors.title.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="req-desc">Descripción</label>
        <textarea id="req-desc" rows={4} {...register('description')} placeholder="Describe el motivo de la solicitud" />
        {errors.description && <span className="field-error">{errors.description.message}</span>}
      </div>

      <div className={requiresAmount ? 'field-row' : ''}>
        {requiresAmount && (
          <div className="field">
            <label htmlFor="req-amount">Importe</label>
            <div className="input-prefix">
              <span>{currencySymbol}</span>
              <input
                id="req-amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                {...register('amount', {
                  setValueAs: (v) => {
                    if (v === '' || v === null || v === undefined) return null;
                    const n = Number(v);
                    return isNaN(n) ? null : n;
                  },
                })}
                placeholder="0,00"
              />
            </div>
            {errors.amount && <span className="field-error">{errors.amount.message as string}</span>}
          </div>
        )}
        <div className="field">
          <label htmlFor="req-cc">Centro de coste</label>
          <select id="req-cc" {...register('cost_center_id')}>
            <option value="">Seleccioná un centro</option>
            {costCenters.map((cc) => <option key={cc.id} value={cc.id}>{cc.name} · {cc.code}</option>)}
          </select>
          {errors.cost_center_id && <span className="field-error">{errors.cost_center_id.message}</span>}
        </div>
      </div>

      <div className="field">
        <span className="field-label">Prioridad</span>
        <div className="priority-group" role="group" aria-label="Prioridad">
          {PRIORITIES.map(({ value, label }) => (
            <button key={value} type="button"
              className={`priority-pill${priority === value ? ' selected' : ''}`}
              onClick={() => setValue('priority', value, { shouldValidate: true })}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
