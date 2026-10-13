'use client';
// Client Component: edición de solicitud con react-hook-form + Zod y Server Action

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2 } from 'lucide-react';
import { ROUTES } from '@/constants';
import { requestSchema, type RequestFormValues } from '@/lib/validations/request.schema';
import { buildRequestFormData } from '@/lib/build-request-form-data';
import { updateRequest } from '@/app/(dashboard)/requests/[id]/actions';
import { RequestFormFields } from '@/components/requests/request-form-fields';
import type { RequestDetailData } from '@/types/request-detail';
import type { Database } from '@/types/database.types';

type RequestType = Pick<
  Database['public']['Tables']['request_types']['Row'],
  'id' | 'name' | 'requires_amount'
>;
type CostCenter = Pick<
  Database['public']['Tables']['cost_centers']['Row'],
  'id' | 'name' | 'code'
>;

interface EditRequestFormProps {
  detail: RequestDetailData;
  requestTypes: RequestType[];
  costCenters: CostCenter[];
  currencySymbol: string;
}

export function EditRequestForm({
  detail,
  requestTypes,
  costCenters,
  currencySymbol,
}: EditRequestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      request_type_id: detail.request.request_type_id,
      title: detail.request.title,
      description: detail.request.description ?? '',
      amount: detail.request.amount != null ? parseFloat(detail.request.amount) : null,
      cost_center_id: detail.request.cost_center_id ?? '',
      priority: detail.request.priority,
      attachments: [],
    },
  });

  // useWatch sin defaultValue devuelve el objeto de defaultValues en el primer
  // render, así que requiresAmount arranca ya correcto si el tipo inicial lo requiere.
  const watchedTypeId = useWatch({ control: form.control, name: 'request_type_id' });
  const selectedType = requestTypes.find((t) => t.id === watchedTypeId);
  const requiresAmount = selectedType?.requires_amount ?? false;

  const typeFieldLocked = detail.request.status === 'changes_requested';
  const lockedTypeName = typeFieldLocked ? detail.request_type.name : null;

  const onSubmit = async (values: RequestFormValues) => {
    if (requiresAmount && (values.amount == null || isNaN(values.amount))) {
      form.setError('amount', { message: 'El importe es requerido para este tipo' });
      return;
    }
    setIsLoading(true);
    setActionError('');
    try {
      const fd = buildRequestFormData({ ...values, attachments: [] });
      const result = await updateRequest(detail.request.id, fd);
      if (!result.ok) setActionError(result.error);
      else router.push(`${ROUTES.REQUESTS}/${detail.request.id}`);
    } catch {
      setActionError('Error inesperado al guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="form-card">
      <div className="form-heading">
        <div className="form-heading-icon"><FileText size={18} /></div>
        <div>
          <h1>Editar solicitud</h1>
          <p>Actualizá los datos de {detail.request.code}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <RequestFormFields
          form={form}
          requestTypes={requestTypes}
          costCenters={costCenters}
          currencySymbol={currencySymbol}
          requiresAmount={requiresAmount}
          typeFieldLocked={typeFieldLocked}
          lockedTypeName={lockedTypeName}
        />

        {actionError && <p className="field-error">{actionError}</p>}

        <div className="form-footer">
          <Link href={`${ROUTES.REQUESTS}/${detail.request.id}`} className="secondary-button">
            Cancelar
          </Link>
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading && <Loader2 size={14} className="animate-spin" />} Guardar cambios
          </button>
        </div>
      </form>
    </section>
  );
}
