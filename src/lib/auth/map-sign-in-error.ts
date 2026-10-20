// Mapeo de errores de supabase.auth.signInWithPassword.
// Solo 'invalid_credentials' no se loguea: es un flujo normal, no un error interno.
export function mapSignInError(error: { code?: string | undefined; message: string }): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'Email o contraseña incorrectos.';
    case 'email_not_confirmed':
      return 'Tu email todavía no fue confirmado.';
    case 'over_request_rate_limit':
      return 'Demasiados intentos. Probá de nuevo en unos minutos.';
    default:
      console.error('signIn: error', { code: error.code, message: error.message });
      return 'No se pudo iniciar sesión. Intentá de nuevo.';
  }
}
