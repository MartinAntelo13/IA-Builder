'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { ROUTES } from '@/constants';
import { resolveOrigin } from '@/lib/auth/resolve-origin';
import { UUID_RE } from '@/lib/validators/uuid';
import { mapResendEmailError } from '@/lib/team/map-resend-error';
import type { ActionResult } from '@/types/action-result';
import { toUserError } from '@/lib/errors/to-user-error';

// Reenvía la invitación a un perfil en status 'invited'. El RPC
// get_invited_member_email autoriza (team.manage + misma org + status) y
// devuelve el email; después llamamos a inviteUserByEmail con service_role
// usando el MISMO redirectTo que inviteMember. Sin compensación: no se crea
// nada nuevo en Auth ni en profiles, no hay estado a medias que revertir.
export async function resendInvitation(userId: string): Promise<ActionResult> {
  if (!UUID_RE.test(userId)) return { ok: false, error: 'ID de miembro inválido.' };

  const supabase = await createSupabaseServerClient();
  const { data: email, error: rpcError } = await supabase.rpc('get_invited_member_email', {
    p_user_id: userId,
  });
  if (rpcError) {
    return { ok: false, error: toUserError(rpcError, { label: 'resendInvitation', fallback: 'No se pudo reenviar la invitación.', forbidden: 'No tenés permisos para reenviar invitaciones.', notFound: 'El miembro no existe.' }) };
  }
  if (!email) return { ok: false, error: 'No se pudo reenviar la invitación.' };

  const origin = await resolveOrigin();
  const admin = createSupabaseAdminClient();
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}${ROUTES.AUTH_CONFIRM}`,
  });
  if (inviteError) {
    console.error('resendInvitation.email: error', { code: inviteError.code, message: inviteError.message });
    return { ok: false, error: mapResendEmailError(inviteError) };
  }

  revalidatePath(ROUTES.TEAM);
  return { ok: true };
}
