// Mapeo de errores de admin.auth.admin.inviteUserByEmail cuando se reenvía
// una invitación. Separado de mapInviteEmailError (invite-actions.ts) porque
// el fallback de ese caso dice "No se creó ningún miembro", que acá es falso:
// el perfil ya existe en status 'invited' y seguirá existiendo.
export function mapResendEmailError(error: { code?: string | undefined; message: string }): string {
  if (error.code === 'email_exists') {
    return 'No se pudo reenviar. Revocá la invitación e invitá de nuevo.';
  }
  if (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit') {
    return 'Se alcanzó el límite de envío de mails. Probá de nuevo más tarde.';
  }

  const m = error.message.toLowerCase();
  if (m.includes('already been registered') || m.includes('already exists')) {
    return 'No se pudo reenviar. Revocá la invitación e invitá de nuevo.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Se alcanzó el límite de envío de mails. Probá de nuevo más tarde.';
  }
  return 'No se pudo reenviar la invitación por mail.';
}
