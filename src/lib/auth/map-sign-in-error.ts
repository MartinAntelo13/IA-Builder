// Mapeo de errores de supabase.auth.signInWithPassword.
// 'invalid_credentials' y 'user_banned' no se loguean: son resultados esperados
// del negocio, no errores internos.
export function mapSignInError(error: { code?: string | undefined; message: string }): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'Email o contraseña incorrectos.';
    case 'user_banned':
      return 'Tu cuenta está deshabilitada. Contactá a un administrador.';
    case 'email_not_confirmed':
      return 'Tu email todavía no fue confirmado.';
    case 'over_request_rate_limit':
      return 'Demasiados intentos. Probá de nuevo en unos minutos.';
    default:
      console.error('signIn: error', { code: error.code, message: error.message });
      return 'No se pudo iniciar sesión. Intentá de nuevo.';
  }
}
