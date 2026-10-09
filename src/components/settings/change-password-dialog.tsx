'use client';
// Regla 3: 'use client' — <dialog>.showModal + react-hook-form + useTransition
// para la Server Action changePassword.

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  passwordSchema,
  type PasswordFormValues,
} from '@/lib/schemas/password.schema';
import { changePassword } from '@/app/(dashboard)/settings/security-actions';
import { INPUT, BTN_PRIMARY, BTN_SECONDARY } from '@/lib/ui/form-classes';

interface ChangePasswordDialogProps {
  onClose: () => void;
}

export function ChangePasswordDialog({ onClose }: ChangePasswordDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  // Diálogo montado abierto: showModal() al montar; onClose desmonta.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function onSubmit(values: PasswordFormValues) {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await changePassword(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-11/12 max-w-md rounded-xl border border-border bg-white shadow-xl p-6 backdrop:bg-black/50"
      onClose={onClose}
    >
      <h2 id={titleId} className="m-0 mb-1 text-foreground text-sm font-semibold tracking-tight">
        Cambiar contraseña
      </h2>
      <p className="m-0 mb-4 text-muted text-2xs">
        Elegí una nueva contraseña para tu cuenta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <label htmlFor="pw-new" className="block text-2xs font-semibold text-muted mb-1">
            Nueva contraseña
          </label>
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={INPUT}
          />
          {errors.password && (
            <p role="alert" className="mt-1 text-2xs text-danger">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="pw-rep" className="block text-2xs font-semibold text-muted mb-1">
            Repetir contraseña
          </label>
          <input
            id="pw-rep"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={INPUT}
          />
          {errors.confirmPassword && (
            <p role="alert" className="mt-1 text-2xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && <p role="alert" className="text-2xs text-danger">{serverError}</p>}
        {success && !serverError && (
          <p role="status" className="text-2xs text-success">Contraseña actualizada.</p>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <button type="submit" disabled={isPending} className={`${BTN_PRIMARY} w-full`}>
            {isPending ? 'Guardando…' : 'Guardar contraseña'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={`${BTN_SECONDARY} w-full`}
          >
            {success ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
