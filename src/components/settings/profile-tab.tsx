'use client';
// Regla 3: 'use client' — react-hook-form + useTransition + registro del
// isDirty/isPending en SettingsSaveProvider para que SaveButton del header
// pueda submitear este form por ID.

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  profileSchema,
  type ProfileFormValues,
} from '@/lib/schemas/profile.schema';
import { updateProfile } from '@/app/(dashboard)/settings/profile-actions';
import { INPUT } from '@/lib/ui/form-classes';
import { useSettingsSave } from '@/components/settings/save-context';
import { TimezoneSelect } from '@/components/settings/timezone-select';

interface ProfileLite {
  id: string;
  email: string;
  fullName: string;
  timezone: string | null;
  roleNames: string[];
}

interface ProfileTabProps {
  profile: ProfileLite;
}

const FORM_ID = 'form-settings-profile';

function initials(name: string, email: string): string {
  const source = name.trim() || email.split('@')[0] || '';
  return source
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const router = useRouter();
  const { setFormState } = useSettingsSave();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultValues: ProfileFormValues = useMemo(
    () => ({ fullName: profile.fullName, timezone: profile.timezone ?? '' }),
    [profile.fullName, profile.timezone],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const timezone = watch('timezone') ?? '';
  const roleLabel = profile.roleNames.join(', ') || '—';
  const avatarInitials = initials(profile.fullName, profile.email);

  // Registrar el estado de este form en el provider; limpiar al desmontar.
  useEffect(() => {
    setFormState({ formId: FORM_ID, isDirty, isPending });
    return () => setFormState({ formId: null, isDirty: false, isPending: false });
  }, [isDirty, isPending, setFormState]);

  function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await updateProfile(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      // reset con los valores enviados → vuelve a isDirty=false sin recargar.
      reset(values);
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Perfil personal</h2>
          <p className="mt-1 text-2xs text-muted">
            Actualizá la información visible para tu equipo.
          </p>
        </div>
        <div className="w-11 h-11 rounded-full bg-primary/10 grid place-items-center text-xs font-bold text-primary shrink-0">
          {avatarInitials}
        </div>
      </div>

      <div className="h-px bg-border my-5" />

      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label htmlFor="pf-name" className="block text-2xs font-semibold text-muted mb-1">
            Nombre completo
          </label>
          <input id="pf-name" type="text" {...register('fullName')} maxLength={120} className={INPUT} />
          {errors.fullName && (
            <p role="alert" className="mt-1 text-2xs text-danger">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="pf-email" className="block text-2xs font-semibold text-muted mb-1">
            Email
          </label>
          {/* Solo lectura: el trigger profiles_guard_update rechaza cambios de email. */}
          <input
            id="pf-email"
            type="email"
            value={profile.email}
            readOnly
            disabled
            className={`${INPUT} opacity-70 cursor-not-allowed`}
          />
          <p className="mt-1 text-2xs text-muted">El email no se puede modificar desde Flowdesk.</p>
        </div>

        <div>
          <label htmlFor="pf-role" className="block text-2xs font-semibold text-muted mb-1">
            Rol
          </label>
          <input
            id="pf-role"
            type="text"
            value={roleLabel}
            readOnly
            disabled
            className={`${INPUT} opacity-70 cursor-not-allowed`}
          />
        </div>

        <div>
          <label htmlFor="pf-tz" className="block text-2xs font-semibold text-muted mb-1">
            Zona horaria
          </label>
          <TimezoneSelect
            id="pf-tz"
            value={timezone}
            onChange={(next) => setValue('timezone', next, { shouldDirty: true, shouldValidate: true })}
            allowOrgDefault
          />
        </div>
      </div>

      {serverError && (
        <p role="alert" className="mt-4 text-2xs text-danger">{serverError}</p>
      )}
      {savedAt && !serverError && (
        <p role="status" className="mt-4 text-2xs text-success">Perfil actualizado.</p>
      )}
    </form>
  );
}
