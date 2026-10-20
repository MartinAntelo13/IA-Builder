// Traducción de errores de supabase.auth.updateUser (política de contraseña).
// Supabase devuelve el mensaje en inglés con palabras clave. Centralizado
// para que /set-password y /settings (seguridad) usen la misma traducción.
export function mapPasswordError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('weak') || m.includes('short') || m.includes('at least')) {
    return 'La contraseña no cumple los requisitos de seguridad. Elegí una más robusta.';
  }
  // "different from the old password" / "same as previous" / etc.
  if (m.includes('same') || m.includes('previous') || m.includes('different')) {
    return 'La nueva contraseña no puede ser igual a la anterior.';
  }
  return 'No se pudo guardar la contraseña.';
}

// Mapeo específico del diálogo "Cambiar contraseña" en Settings: usa el `code`
// de supabase-js (ver node_modules/@supabase/auth-js .../lib/error-codes.d.ts)
// y devuelve siempre un mensaje en español. NUNCA devuelve el mensaje crudo.
//
// NO VERIFICADO: el código exacto que Supabase devuelve cuando la contraseña
// actual es incorrecta no está confirmado en runtime. Se asume
// 'invalid_credentials' y se registra el código real en el log del servidor
// (console.error en security-actions.ts) para ajustarlo en el QA.
export function mapChangePasswordError(error: { code?: string; message: string }): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'La contraseña actual no es correcta.';
    case 'same_password':
      return 'La nueva contraseña no puede ser igual a la anterior.';
    case 'weak_password':
      return 'La contraseña no cumple los requisitos de seguridad. Elegí una más robusta.';
    case 'reauthentication_needed':
    case 'reauthentication_not_valid':
    case 'reauth_nonce_missing':
      return 'Por seguridad, volvé a iniciar sesión para cambiar tu contraseña.';
    case 'over_request_rate_limit':
      return 'Demasiados intentos. Probá de nuevo en unos minutos.';
    default:
      return 'No se pudo guardar la contraseña.';
  }
}
