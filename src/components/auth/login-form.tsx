// 'use client' - requires useState for form state and password visibility toggle,
// plus form submission handling with react-hook-form
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginSchema } from '@/lib/validations/auth.schema';
import { ROUTES } from '@/constants';
import { signIn } from '@/app/(auth)/login/actions';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setAuthError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      const result = await signIn(formData);

      // En éxito, signIn() ejecuta redirect() en el servidor y Next.js
      // realiza la navegación automáticamente; este código no continúa.
      if (result?.error) {
        setAuthError(result.error);
      }
    } catch {
      setAuthError('Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="login-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <label>
          Email
          <input
            {...register('email')}
            type="email"
            placeholder="usuario@empresa.com"
            required
          />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>

        <label className="password-field">
          <span className="password-label-row">
            <span>Contraseña</span>
            <a href={ROUTES.FORGOT_PASSWORD}>¿La olvidaste?</a>
          </span>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center border-0 bg-transparent text-[#8d96a6]"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </label>

        {authError && <span className="field-error">{authError}</span>}

        <button
          className="login-submit"
          type="submit"
          disabled={isSubmitting || loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="login-access">
        ¿No tienes cuenta?{' '}
        <a href="mailto:admin@flowdesk.com">Solicita acceso a tu administrador</a>
      </p>
    </>
  );
};
