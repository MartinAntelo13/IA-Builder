// 'use client' - requiere useState/useForm para estado compartido con preview
// y manejo de archivos con react-hook-form + Zod
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { requestSchema, type RequestFormValues } from '@/lib/validations/request.schema';
import { buildRequestFormData } from '@/lib/build-request-form-data';
import { createRequest, submitRequest } from '@/app/(dashboard)/requests/new/actions';
import { RequestPreview } from '@/components/requests/request-preview';
import { AttachmentField } from '@/components/requests/attachment-field';
import type { Database } from '@/types/database.types';

type RequestType = Pick<
  Database['public']['Tables']['request_types']['Row'],
  'id' | 'name' | 'requires_amount'
>;
type CostCenter = Pick<
  Database['public']['Tables']['cost_centers']['Row'],
  'id' | 'name' | 'code'
>;

interface NewRequestFormProps {
  requestTypes: RequestType[];
  costCenters: CostCenter[];
  currencySymbol: string;
}

const PRIORITIES = [
  { value: 'low', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
] as const;

export function NewRequestForm({ requestTypes, costCenters, currencySymbol }: NewRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [requiresAmount, setRequiresAmount] = useState(false);

  const { register, handleSubmit, watch, setValue, setError, getValues, trigger, formState: { errors } } =
    useForm<RequestFormValues>({
      resolver: zodResolver(requestSchema),
      defaultValues: { priority: 'normal', attachments: [], amount: null },
    });

  const watched = watch();
  const selectedType = requestTypes.find((t) => t.id === watched.request_type_id);
  const selectedCC = costCenters.find((cc) => cc.id === watched.cost_center_id);
  const typeField = register('request_type_id');

  const handleAction = async (mode: 'draft' | 'submit', values?: RequestFormValues) => {
    if (requiresAmount) {
      const amt = getValues('amount');
      if (amt == null || isNaN(amt)) {
        setError('amount', { message: 'El importe es requerido para este tipo' });
        return;
      }
    }
    if (mode === 'draft' && !(await trigger())) return;
    setIsLoading(true);
    setActionError('');
    try {
      const fd = buildRequestFormData(values ?? getValues());
      const result = mode === 'draft' ? await createRequest(fd) : await submitRequest(fd);
      if (result?.error) setActionError(result.error);
    } catch {
      setActionError(`Error inesperado al ${mode === 'draft' ? 'guardar el borrador' : 'enviar la solicitud'}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (values: RequestFormValues) => handleAction('submit', values);

  return (
    <div className="request-layout">
      <section className="form-card">
        <div className="form-heading">
          <div className="form-heading-icon"><FileText size={18} /></div>
          <div>
            <h1>Nueva solicitud</h1>
            <p>Completa los datos para enviar tu petición a revisión</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="req-type">Tipo de solicitud</label>
            <select
              id="req-type"
              {...typeField}
              onChange={(e) => {
                typeField.onChange(e);
                const type = requestTypes.find((t) => t.id === e.target.value);
                setRequiresAmount(type?.requires_amount ?? false);
                if (!type?.requires_amount) setValue('amount', null);
              }}
            >
              <option value="">Seleccioná un tipo</option>
              {requestTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
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
                  className={`priority-pill${watched.priority === value ? ' selected' : ''}`}
                  onClick={() => setValue('priority', value, { shouldValidate: true })}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <AttachmentField
            files={watched.attachments}
            error={errors.attachments?.message as string | undefined}
            onChange={(files) => setValue('attachments', files, { shouldValidate: true })}
          />

          {actionError && <p className="field-error">{actionError}</p>}

          <div className="form-footer">
            <button type="button" className="secondary-button" onClick={() => handleAction('draft')} disabled={isLoading}>
              {isLoading && <Loader2 size={14} className="animate-spin" />} Guardar borrador
            </button>
            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading && <Loader2 size={14} className="animate-spin" />} Enviar a revisión <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </section>

      <RequestPreview
        title={watched.title ?? ''}
        typeName={selectedType?.name}
        priority={watched.priority ?? 'normal'}
        amount={requiresAmount ? watched.amount : null}
        costCenterName={selectedCC?.name}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
