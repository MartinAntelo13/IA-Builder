import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SetPasswordForm } from '@/components/auth/set-password-form';

// La página sin sesión no debería llegar acá (el proxy redirige), pero
// se chequea de nuevo acá para que el renderizado sea seguro.
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <main className="login-page">
      <section className="login-card recovery-card" aria-labelledby="resetpass-title">
        <div className="login-visual">
          <div className="login-brand">
            <span className="brand-mark">
              <ShieldCheck size={19} />
            </span>
            <span>Flowdesk</span>
          </div>
        </div>
        <div className="login-content">
          <p className="eyebrow">RECUPERAR ACCESO</p>
          <h1 id="resetpass-title">Elegí una nueva contraseña</h1>
          <p className="login-subtitle">
            Creá una contraseña nueva para volver a entrar a Flowdesk.
          </p>
          <SetPasswordForm />
        </div>
      </section>
    </main>
  );
}
