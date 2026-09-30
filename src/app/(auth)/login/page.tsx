/**
 * Login page - Server Component.
 * Renders the login form via the client component.
 *
 * Si el usuario ya está logueado, redirige al home.
 */
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { LoginForm } from '@/components/auth/login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
   // redirect(ROUTES.HOME);
   return (
    <div>
      Ya iniciaste sesión.
    </div>
  );
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-visual">
          <div className="login-brand">
            <span className="brand-mark">
              <ShieldCheck size={19} />
            </span>
            <span>Flowdesk</span>
          </div>
        </div>
        <div className="login-content">
          <p className="eyebrow">ESPACIO DE TRABAJO</p>
          <h1 id="login-title">Bienvenida de nuevo</h1>
          <p className="login-subtitle">Accede a tu espacio para gestionar solicitudes y aprobaciones.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}