'use client';
// Regla 3: 'use client' — react-hook-form + useTransition + registro de
// isDirty/isPending en SettingsSaveProvider para el SaveButton del header.

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import {
  workspaceSchema,
  type WorkspaceFormValues,
} from '@/lib/schemas/workspace.schema';
import { updateWorkspace } from '@/app/(dashboard)/settings/workspace-actions';
import { INPUT } from '@/lib/ui/form-classes';
import { useSettingsSave } from '@/components/settings/save-context';
import { TimezoneSelect } from '@/components/settings/timezone-select';
import type { Database } from '@/types/database.types';

type OrganizationRow = Database['public']['Tables']['organizations']['Row'];

interface WorkspaceTabProps {
  organization: OrganizationRow;
}

const FORM_ID = 'form-settings-workspace';

export function WorkspaceTab({ organization }: WorkspaceTabProps) {
  const router = useRouter();
  const { setFormState } = useSettingsSave();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultValues: WorkspaceFormValues = useMemo(
    () => ({
      name: organization.name,
      domain: organization.domain ?? '',
      description: organization.description ?? '',
      currencyCode: organization.currency_code,
      currencySymbol: organization.currency_symbol,
      timezone: organization.timezone,
      supportEmail: organization.support_email ?? '',
    }),
    [organization],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const timezone = watch('timezone');
  const currencyCodeValue = watch('currencyCode');

  useEffect(() => {
    setFormState({ formId: FORM_ID, isDirty, isPending });
    return () => setFormState({ formId: null, isDirty: false, isPending: false });
  }, [isDirty, isPending, setFormState]);

  function onSubmit(values: WorkspaceFormValues) {
    setServerError(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await updateWorkspace(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      reset(values);
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Espacio de trabajo</h2>
          <p className="mt-1 text-2xs text-muted">
            Configurá los datos generales de tu organización.
          </p>
        </div>
        <ShieldCheck size={20} className="text-primary shrink-0" aria-hidden="true" />
      </div>

      <div className="h-px bg-border my-5" />

      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label htmlFor="ws-name" className="block text-2xs font-semibold text-muted mb-1">
            Nombre del espacio
          </label>
          <input id="ws-name" type="text" {...register('name')} maxLength={120} className={INPUT} />
          {errors.name && <p role="alert" className="mt-1 text-2xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="ws-domain" className="block text-2xs font-semibold text-muted mb-1">
            Dominio
          </label>
          <input id="ws-domain" type="text" {...register('domain')} placeholder="empresa.com" className={INPUT} />
          {errors.domain && <p role="alert" className="mt-1 text-2xs text-danger">{errors.domain.message}</p>}
        </div>
        <div className="col-span-2 max-md:col-span-1">
          <label htmlFor="ws-desc" className="block text-2xs font-semibold text-muted mb-1">
            Descripción
          </label>
          <textarea id="ws-desc" rows={3} {...register('description')} maxLength={500} className={INPUT} />
          {errors.description && <p role="alert" className="mt-1 text-2xs text-danger">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="ws-currency" className="block text-2xs font-semibold text-muted mb-1">
            Moneda (ISO 4217)
          </label>
          <input
            id="ws-currency"
            type="text"
            value={currencyCodeValue}
            onChange={(e) =>
              setValue('currencyCode', e.target.value.toUpperCase(), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            maxLength={3}
            placeholder="EUR"
            className={INPUT}
          />
          {errors.currencyCode && <p role="alert" className="mt-1 text-2xs text-danger">{errors.currencyCode.message}</p>}
        </div>
        <div>
          <label htmlFor="ws-symbol" className="block text-2xs font-semibold text-muted mb-1">
            Símbolo
          </label>
          <input
            id="ws-symbol"
            type="text"
            {...register('currencySymbol')}
            maxLength={4}
            placeholder="€"
            className={INPUT}
          />
          {errors.currencySymbol && <p role="alert" className="mt-1 text-2xs text-danger">{errors.currencySymbol.message}</p>}
        </div>

        <div>
          <label htmlFor="ws-tz" className="block text-2xs font-semibold text-muted mb-1">
            Zona horaria
          </label>
          <TimezoneSelect
            id="ws-tz"
            value={timezone}
            onChange={(next) => setValue('timezone', next, { shouldDirty: true, shouldValidate: true })}
          />
          {errors.timezone && <p role="alert" className="mt-1 text-2xs text-danger">{errors.timezone.message}</p>}
        </div>
        <div>
          <label htmlFor="ws-support" className="block text-2xs font-semibold text-muted mb-1">
            Email de soporte
          </label>
          <input id="ws-support" type="email" {...register('supportEmail')} className={INPUT} />
          {errors.supportEmail && <p role="alert" className="mt-1 text-2xs text-danger">{errors.supportEmail.message}</p>}
        </div>
      </div>

      {/* TODO: zona de peligro (eliminar organización) — no hay RPC ni permiso. */}

      {serverError && <p role="alert" className="mt-4 text-2xs text-danger">{serverError}</p>}
      {savedAt && !serverError && (
        <p role="status" className="mt-4 text-2xs text-success">Organización actualizada.</p>
      )}
    </form>
  );
}
