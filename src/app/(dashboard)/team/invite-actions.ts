'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { ROUTES } from '@/constants';
import { resolveOrigin } from '@/lib/auth/resolve-origin';
import { inviteSchema, type InviteFormValues } from '@/lib/schemas/invite.schema';
import { UUID_RE } from '@/lib/validators/uuid';
import type { Database } from '@/types/database.types';
import type { ActionResult } from '@/types/action-result';
import { toUserError } from '@/lib/errors/to-user-error';
import { firstIssueMessage } from '@/lib/errors/first-issue-message';

type InviteMemberArgs = Database['public']['Functions']['invite_member']['Args'];

// Mapeo de errores de admin.auth.admin.inviteUserByEmail (string message).
function mapInviteEmailError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Se alcanzó el límite de envío de mails. Probá de nuevo más tarde.';
  }
  if (m.includes('already been registered') || m.includes('already exists')) {
    return 'Ya existe un usuario con ese email.';
  }
  return 'No se pudo enviar la invitación por mail. No se creó ningún miembro.';
}

// invite_member.Args define las opcionales como `string | undefined` (no null):
// se OMITEN las claves vacías (mismo patrón que buildUpdateArgs en actions.ts).
function buildInviteArgs(input: InviteFormValues): InviteMemberArgs {
  const trimmedJob = input.jobTitle.trim();
  const args: InviteMemberArgs = {
    p_email: input.email,
    p_full_name: input.fullName,
    p_role_code: input.roleCode,
  };
  if (trimmedJob) args.p_job_title = trimmedJob;
  if (input.departmentId) args.p_department_id = input.departmentId;
  if (input.managerId) args.p_manager_id = input.managerId;
  return args;
}

export async function inviteMember(input: InviteFormValues): Promise<ActionResult> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const args = buildInviteArgs(parsed.data);
  const { data: invitation, error: rpcError } = await supabase.rpc('invite_member', args);
  if (rpcError) {
    return { ok: false, error: toUserError(rpcError, { label: 'inviteMember', fallback: 'No se pudo crear la invitación.', forbidden: 'No tenés permisos para invitar miembros.' }) };
  }
  if (!invitation) {
    return { ok: false, error: 'No se pudo crear la invitación.' };
  }

  const origin = await resolveOrigin();
  const admin = createSupabaseAdminClient();
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(invitation.email, {
    redirectTo: `${origin}${ROUTES.AUTH_CONFIRM}`,
  });

  if (inviteError) {
    // COMPENSACIÓN: el envío falló. Revertimos lo que haya quedado en pie.
    // supabase-js devuelve { error } (no lanza); el try/catch exterior solo
    // atrapa excepciones inesperadas (p. ej. problemas de red fuera del cliente).
    // console.error permitido: la compensación es best-effort; dejamos rastro
    // para que el equipo técnico limpie manualmente si algo falla.
    try {
      const { error: revokeInvErr } = await supabase.rpc('revoke_invitation', {
        p_invitation_id: invitation.id,
      });
      if (revokeInvErr) {
        console.error(
          '[inviteMember] revoke_invitation falló durante la compensación',
          revokeInvErr,
        );
      }

      // EXCEPTION (Regla 10): no hay RPC para "buscar perfil por email".
      // RLS filtra por organización, así que la lectura es segura.
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, status')
        .eq('email', invitation.email)
        .maybeSingle();
      if (profileErr) {
        console.error(
          '[inviteMember] lectura de perfil falló durante la compensación',
          profileErr,
        );
      } else if (profile && profile.status === 'invited') {
        const { error: revokeMemberErr } = await supabase.rpc('revoke_invited_member', {
          p_user_id: profile.id,
        });
        if (revokeMemberErr) {
          // No llamamos a admin.deleteUser: profiles.id referencia auth.users
          // con ON DELETE RESTRICT, así que el borrado fallaría igual.
          console.error(
            '[inviteMember] revoke_invited_member falló durante la compensación',
            revokeMemberErr,
          );
        } else {
          const { error: delErr } = await admin.auth.admin.deleteUser(profile.id);
          if (delErr) {
            console.error(
              '[inviteMember] admin.deleteUser falló durante la compensación',
              delErr,
            );
          }
        }
      }
    } catch (e) {
      console.error('[inviteMember] excepción inesperada durante la compensación', e);
    }
    console.error('inviteMember.email: error', { code: inviteError.code, message: inviteError.message });
    return { ok: false, error: mapInviteEmailError(inviteError.message) };
  }

  revalidatePath(ROUTES.TEAM);
  return { ok: true };
}

export async function revokeInvitedMember(userId: string): Promise<ActionResult> {
  if (!UUID_RE.test(userId)) return { ok: false, error: 'ID de miembro inválido.' };

  const supabase = await createSupabaseServerClient();
  const { error: rpcError } = await supabase.rpc('revoke_invited_member', { p_user_id: userId });
  if (rpcError) {
    return { ok: false, error: toUserError(rpcError, { label: 'revokeInvitedMember', fallback: 'No se pudo revocar la invitación.', forbidden: 'No tenés permisos para revocar invitaciones.', notFound: 'El miembro no existe.' }) };
  }

  const admin = createSupabaseAdminClient();
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
    // console.error permitido: el perfil ya fue borrado por el RPC; dejar
    // trazas del fallo de limpieza en Auth para el equipo técnico.
    console.error('[revokeInvitedMember] admin.deleteUser falló tras revocar el perfil', delErr);
    revalidatePath(ROUTES.TEAM);
    return {
      ok: false,
      error:
        'La invitación se revocó, pero no se pudo eliminar el acceso en Auth. Avisá al equipo técnico.',
    };
  }

  revalidatePath(ROUTES.TEAM);
  return { ok: true };
}
