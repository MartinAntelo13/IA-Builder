'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import { memberSchema, type MemberFormValues } from '@/lib/schemas/member.schema';
import type { Database } from '@/types/database.types';
import type { ActionResult } from '@/types/action-result';
import { UUID_RE } from '@/lib/validators/uuid';
import { toUserError } from '@/lib/errors/to-user-error';

type UpdateMemberArgs = Database['public']['Functions']['update_member']['Args'];

// Los tipos generados exigen OMITIR las claves opcionales en lugar de pasar
// undefined/null, porque Args define `string | undefined` (no null). Cuando se
// quiere vaciar el campo en la base, se omite y el RPC lo trata como null
// (reemplaza por null porque update_member REEMPLAZA todos los campos).
function buildUpdateArgs(userId: string, input: MemberFormValues): UpdateMemberArgs {
  const trimmedJob = input.jobTitle.trim();
  const args: UpdateMemberArgs = {
    p_user_id: userId,
    p_status: input.status,
    p_role_codes: input.roleCodes,
  };
  if (trimmedJob) args.p_job_title = trimmedJob;
  if (input.departmentId) args.p_department_id = input.departmentId;
  if (input.managerId) args.p_manager_id = input.managerId;
  return args;
}

export async function updateMember(
  userId: string,
  input: MemberFormValues,
): Promise<ActionResult> {
  if (!UUID_RE.test(userId)) return { ok: false, error: 'ID de miembro inválido' };

  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createSupabaseServerClient();
  const args = buildUpdateArgs(userId, parsed.data);
  const { error } = await supabase.rpc('update_member', args);
  if (error) return { ok: false, error: toUserError(error, { label: 'updateMember', fallback: 'No se pudo actualizar el miembro.', forbidden: 'No tenés permisos para editar miembros.', notFound: 'El miembro no existe.' }) };

  revalidatePath(ROUTES.TEAM);
  return { ok: true };
}

export async function setMemberStatus(
  userId: string,
  status: 'active' | 'disabled',
): Promise<ActionResult> {
  if (!UUID_RE.test(userId)) return { ok: false, error: 'ID de miembro inválido' };

  const supabase = await createSupabaseServerClient();

  // EXCEPTION (Regla 10): no existe RPC de lectura de un miembro. update_member
  // REEMPLAZA todos los campos; necesitamos los valores actuales (cargo,
  // departamento, responsable y role codes) para no vaciarlos al cambiar el
  // estado desde el menú "···".
  const [profileResult, userRolesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('status, job_title, department_id, manager_id')
      .eq('id', userId)
      .single(),
    supabase.from('user_roles').select('role_id').eq('user_id', userId),
  ]);

  if (profileResult.error) {
    return { ok: false, error: toUserError(profileResult.error, { label: 'toggleMemberStatus.read', fallback: 'No se pudo cargar el miembro.', notFound: 'El miembro no existe.' }) };
  }
  if (!profileResult.data) {
    return { ok: false, error: 'El miembro no existe.' };
  }
  if (userRolesResult.error) {
    return { ok: false, error: toUserError(userRolesResult.error, { label: 'toggleMemberStatus.read', fallback: 'No se pudo cargar el miembro.' }) };
  }

  if (profileResult.data.status === 'invited') {
    return {
      ok: false,
      error: 'No se puede cambiar el estado de un miembro con invitación pendiente.',
    };
  }

  const roleIds = (userRolesResult.data ?? []).map((r) => r.role_id);
  const rolesResult =
    roleIds.length > 0
      ? await supabase.from('roles').select('code').in('id', roleIds)
      : { data: [] as { code: string }[], error: null };
  if (rolesResult.error) return { ok: false, error: toUserError(rolesResult.error, { label: 'toggleMemberStatus.read', fallback: 'No se pudo cargar el miembro.' }) };

  const roleCodes = (rolesResult.data ?? []).map((r) => r.code);

  const input: MemberFormValues = {
    jobTitle: profileResult.data.job_title ?? '',
    departmentId: profileResult.data.department_id,
    managerId: profileResult.data.manager_id,
    roleCodes,
    status,
  };

  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const args = buildUpdateArgs(userId, parsed.data);
  const { error } = await supabase.rpc('update_member', args);
  if (error) return { ok: false, error: toUserError(error, { label: 'updateMember', fallback: 'No se pudo actualizar el miembro.', forbidden: 'No tenés permisos para editar miembros.', notFound: 'El miembro no existe.' }) };

  revalidatePath(ROUTES.TEAM);
  return { ok: true };
}
