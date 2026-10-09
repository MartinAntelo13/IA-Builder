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
  return message || 'No se pudo guardar la contraseña.';
}
