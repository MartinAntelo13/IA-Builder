'use client';
// Regla 3: 'use client' — react-hook-form + useTransition para disparar la
// Server Action setInitialPassword y manejar el error inline.

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { passwordSchema, type PasswordFormValues } from '@/lib/schemas/password.schema';
import { setInitialPassword } from '@/app/(auth)/set-password/actions';

export const SetPasswordForm: React.FC = () => {
  const [serverError, setServerError] = React.useState('');
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (values: PasswordFormValues) => {
    setServerError('');
    startTransition(async () => {
      const result = await setInitialPassword(values);
      // Si todo salió bien, el server redirige y este código no corre.
      if (!result.ok) {
        setServerError(result.error);
      }
    });
  };

  return (
    <form className="login-form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <label>
        Nueva contraseña
        <input
          {...register('password')}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
        {errors.password && <span className="field-error">{errors.password.message}</span>}
      </label>

      <label>
        Repetir contraseña
        <input
          {...register('confirmPassword')}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
        {errors.confirmPassword && (
          <span className="field-error">{errors.confirmPassword.message}</span>
        )}
      </label>

      {serverError && (
        <span className="field-error" role="alert">
          {serverError}
        </span>
      )}

      <button className="login-submit" type="submit" disabled={isPending}>
        <KeyRound size={16} />
        {isPending ? 'Guardando...' : 'Guardar contraseña'}
      </button>
    </form>
  );
};
