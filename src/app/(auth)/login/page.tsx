/**
 * Login page - Server Component.
 * Renders the login form via the client component.
 *
 * Si el usuario ya está logueado, redirige al home.
 */
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants';
import { getCurrentProfile } from '@/lib/supabase/server';
import { LoginForm } from '@/components/auth/login-form';

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Mapea los flags de error que vienen por querystring (p. ej. desde el route
// handler /auth/confirm) a mensajes en español mostrables al usuario.
function mapQueryError(code: string | undefined): string {
  if (code === 'invitacion_invalida') {
    return 'El link de invitación es inválido o expiró. Pedile a un administrador que te invite de nuevo.';
  }
  return '';
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(ROUTES.HOME);
  }

  const params = await searchParams;
  const errorParam = typeof params.error === 'string' ? params.error : undefined;
  const initialError = mapQueryError(errorParam);

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
          <LoginForm initialError={initialError} />
        </div>
      </section>
    </main>
  );
}
