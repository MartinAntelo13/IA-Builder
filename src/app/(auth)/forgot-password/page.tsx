/**
 * Forgot password page - Server Component.
 * Renders the forgot password form via the client component.
 *
 * Si el usuario ya está logueado, redirige al home.
 */
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants';
import { getCurrentProfile } from '@/lib/supabase/server';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const dynamic = 'force-dynamic';

interface ForgotPasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Mapea los flags de error que vienen por querystring (p. ej. desde el route
// handler /auth/confirm) a mensajes en español mostrables al usuario.
function mapQueryError(code: string | undefined): string {
  if (code === 'enlace_invalido') {
    return 'El enlace es inválido o venció. Pedí uno nuevo.';
  }
  return '';
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(ROUTES.HOME);
  }

  const params = await searchParams;
  const errorParam = typeof params.error === 'string' ? params.error : undefined;
  const initialError = mapQueryError(errorParam);

  return (
    <main className="login-page">
      <section className="login-card recovery-card" aria-labelledby="recovery-title">
        <div className="login-visual">
          <div className="login-brand">
            <span className="brand-mark">
              <ShieldCheck size={19} />
            </span>
            <span>Flowdesk</span>
          </div>
        </div>
        <div className="login-content">
          <ForgotPasswordForm initialError={initialError} />
        </div>
      </section>
    </main>
  );
}
