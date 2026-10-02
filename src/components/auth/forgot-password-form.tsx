// 'use client' - requires useState for form state and step management,
// plus form submission handling with react-hook-form
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordSchema } from '@/lib/validations/auth.schema';
import { ROUTES } from '@/constants';
import { forgotPassword } from '@/app/(auth)/forgot-password/actions';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState<'form' | 'confirmation'>('form');
  const [email, setEmail] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', data.email);

      const result = await forgotPassword(formData);

      if (result?.error) {
        // Error is shown inline via react-hook-form
        return;
      }

      setEmail(data.email);
      setStep('confirmation');
    } catch {
      // Error will be shown inline
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
        <button className="login-submit" type="submit" disabled={isSubmitting || loading}>
          {loading ? 'Enviando...' : 'Enviar enlace'} <Mail size={16} />
        </button>
      </form>
      <p className="login-note">El enlace será válido durante 30 minutos</p>
    </>
  );
};
