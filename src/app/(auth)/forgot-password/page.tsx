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

export default async function ForgotPasswordPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(ROUTES.HOME);
  }

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
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
