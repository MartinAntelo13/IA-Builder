// 'use client' - requiere useState/useForm para estado compartido con preview
// y manejo de archivos con react-hook-form + Zod
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { requestSchema, type RequestFormValues } from '@/lib/validations/request.schema';
import { validateAttachmentFiles } from '@/lib/validations/attachment-file';
import { buildRequestFormData } from '@/lib/build-request-form-data';
import { createRequest, submitRequest } from '@/app/(dashboard)/requests/new/actions';
import { RequestPreview } from '@/components/requests/request-preview';
import { AttachmentField } from '@/components/requests/attachment-field';
import { RequestFormFields } from '@/components/requests/request-form-fields';
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

export function NewRequestForm({ requestTypes, costCenters, currencySymbol }: NewRequestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { priority: 'normal', attachments: [], amount: null },
  });
  const { control, getValues, trigger, setError, setValue, formState: { errors } } = form;
  const watched = useWatch({ control });
  const selectedType = requestTypes.find((t) => t.id === watched.request_type_id);
  const selectedCC = costCenters.find((cc) => cc.id === watched.cost_center_id);
  const requiresAmount = selectedType?.requires_amount ?? false;

  const handleAction = async (mode: 'draft' | 'submit', values?: RequestFormValues) => {
    if (requiresAmount) {
      const amt = getValues('amount');
      if (amt == null || isNaN(amt)) {
        setError('amount', { message: 'El importe es requerido para este tipo' });
        return;
      }
    }
    if (mode === 'draft' && !(await trigger())) return;
    const files = (values ?? getValues()).attachments ?? [];
    const filesValidation = validateAttachmentFiles(files);
    if (!filesValidation.ok) {
      setActionError(filesValidation.error);
      return;
    }
    setIsLoading(true);
    setActionError('');
    try {
      const fd = buildRequestFormData(values ?? getValues());
      const result = mode === 'draft' ? await createRequest(fd) : await submitRequest(fd);
      if (result?.error && result.requestId)
        router.push(`${ROUTES.REQUESTS}/${result.requestId}?submit_error=${encodeURIComponent(result.error.slice(0, 200))}`);
      else if (result?.error) setActionError(result.error);
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

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <RequestFormFields
            form={form}
            requestTypes={requestTypes}
            costCenters={costCenters}
            currencySymbol={currencySymbol}
            requiresAmount={requiresAmount}
          />

          <AttachmentField
            files={watched.attachments ?? []}
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
        amount={requiresAmount ? (watched.amount ?? null) : null}
        costCenterName={selectedCC?.name}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
