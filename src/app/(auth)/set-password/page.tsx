import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SetPasswordForm } from '@/components/auth/set-password-form';

// La página sin sesión no debería llegar acá (el middleware redirige), pero
// se chequea de nuevo acá para que el renderizado sea seguro.
export const dynamic = 'force-dynamic';

export default async function SetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <main className="login-page">
      <section className="login-card recovery-card" aria-labelledby="setpass-title">
        <div className="login-visual">
          <div className="login-brand">
            <span className="brand-mark">
              <ShieldCheck size={19} />
            </span>
            <span>Flowdesk</span>
          </div>
        </div>
        <div className="login-content">
          <p className="eyebrow">ACTIVÁ TU CUENTA</p>
          <h1 id="setpass-title">Creá tu contraseña</h1>
          <p className="login-subtitle">
            Elegí una contraseña para terminar de activar tu cuenta y poder entrar a Flowdesk.
          </p>
          <SetPasswordForm />
        </div>
      </section>
    </main>
  );
}
