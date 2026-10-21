// 'use client' - requires useState for form state and step management,
// plus form submission handling with react-hook-form
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas/auth.schema';
import { ROUTES } from '@/constants';
import { forgotPassword } from '@/app/(auth)/forgot-password/actions';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react';

interface ForgotPasswordFormProps {
  initialError?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ initialError = '' }) => {
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState<'form' | 'confirmation'>('form');
  const [email, setEmail] = React.useState('');
  const [authError, setAuthError] = React.useState(initialError);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setAuthError('');
    setLoading(true);
    try {
      const result = await forgotPassword(data);

      if (!result.ok) {
        setAuthError(result.error);
        return;
      }

      setEmail(data.email);
      setStep('confirmation');
    } catch {
      setAuthError('Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <div className="recovery-success">
        <span className="recovery-success-icon">
          <CheckCircle2 size={26} />
        </span>
        <p className="eyebrow">ENLACE ENVIADO</p>
        <h1 id="recovery-title">Revisa tu bandeja de entrada</h1>
        <p className="login-subtitle">
          Si existe una cuenta asociada a {email}, recibirás instrucciones para crear una nueva
          contraseña.
        </p>
        <Link className="login-submit recovery-action" href={ROUTES.LOGIN}>
          Volver al inicio de sesión <ArrowRight size={16} />
        </Link>
        <button className="recovery-resend" type="button" onClick={() => setStep('form')}>
          Reenviar correo
        </button>
      </div>
    );
  }

  return (
    <>
      <Link className="recovery-back" href={ROUTES.LOGIN}>
        <ArrowLeft size={14} /> Volver al inicio de sesión
      </Link>
      <p className="eyebrow">RECUPERAR ACCESO</p>
      <h1 id="recovery-title">¿Olvidaste tu contraseña?</h1>
      <p className="login-subtitle">Introduce tu email y te enviaremos un enlace para restablecerla.</p>
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
        {authError && <span className="field-error" role="alert">{authError}</span>}
        <button className="login-submit" type="submit" disabled={isSubmitting || loading}>
          {loading ? 'Enviando...' : 'Enviar enlace'} <Mail size={16} />
        </button>
      </form>
      <p className="login-note">El enlace vence después de un tiempo y solo puede usarse una vez.</p>
    </>
  );
};
