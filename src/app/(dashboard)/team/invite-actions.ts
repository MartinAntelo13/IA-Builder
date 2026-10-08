'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { ROUTES } from '@/constants';
import { env } from '@/lib/env';
import { inviteSchema, type InviteFormValues } from '@/lib/schemas/invite.schema';
import { UUID_RE } from '@/lib/validators/uuid';
import type { Database } from '@/types/database.types';
import type { ActionResult } from '@/types/action-result';

type InviteMemberArgs = Database['public']['Functions']['invite_member']['Args'];

// Mapeo de errores del RPC invite_member.
//   42501: permisos insuficientes
//   P0001: validación de negocio con mensaje en español (mostrable tal cual)
function mapInviteRpcError(code: string | undefined, message: string): string {
  if (code === '42501') return 'No tenés permisos para invitar miembros.';
  if (code === 'P0001') return message;
  return 'No se pudo crear la invitación.';
}

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

// Origen para el redirectTo: preferimos headers() del request real (expone el
// dominio donde está corriendo la app); fallback a X-Forwarded y luego a env.
// Normalizamos la barra final para que redirectTo = origin + ROUTES.AUTH_CONFIRM
// no termine con "//auth/confirm".
async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get('origin');
  if (origin) return origin.replace(/\/+$/, '');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) return `${proto}://${host}`;
  return env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
}

export async function inviteMember(input: InviteFormValues): Promise<ActionResult> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createSupabaseServerClient();
  const args = buildInviteArgs(parsed.data);
  const { data: invitation, error: rpcError } = await supabase.rpc('invite_member', args);
  if (rpcError) {
    return { ok: false, error: mapInviteRpcError(rpcError.code, rpcError.message) };
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
    return { ok: false, error: mapInviteEmailError(inviteError.message) };
  }

  revalidatePath(ROUTES.TEAM);
  return { ok: true };
}

export async function revokeInvitedMember(userId: string): Promise<ActionResult> {
  if (!UUID_RE.test(userId)) return { ok: false, error: 'ID de miembro inválido' };

  const supabase = await createSupabaseServerClient();
  const { error: rpcError } = await supabase.rpc('revoke_invited_member', { p_user_id: userId });
  if (rpcError) {
    if (rpcError.code === '42501') {
      return { ok: false, error: 'No tenés permisos para revocar invitaciones.' };
    }
    if (rpcError.code === 'P0002') return { ok: false, error: 'El miembro no existe.' };
    if (rpcError.code === 'P0001') return { ok: false, error: rpcError.message };
    return { ok: false, error: 'No se pudo revocar la invitación.' };
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
