'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import { memberSchema, type MemberFormValues } from '@/lib/schemas/member.schema';
import type { Database } from '@/types/database.types';
import type { ActionResult } from '@/types/action-result';

const UUID_RE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

type UpdateMemberArgs = Database['public']['Functions']['update_member']['Args'];

// Mapeo de errores del RPC update_member:
//   42501: permisos insuficientes
//   P0002: miembro no encontrado
//   P0001: validación de negocio (mensaje en español, mostrable tal cual)
function mapUpdateMemberError(code: string | undefined, message: string): string {
  if (code === '42501') return 'No tenés permisos para editar miembros.';
  if (code === 'P0002') return 'El miembro no existe.';
  return message || 'Error al actualizar el miembro.';
}

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
  if (error) return { ok: false, error: mapUpdateMemberError(error.code, error.message) };

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

  if (profileResult.error || !profileResult.data) {
    return { ok: false, error: profileResult.error?.message ?? 'Miembro no encontrado' };
  }
  if (userRolesResult.error) {
    return { ok: false, error: userRolesResult.error.message };
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
  if (rolesResult.error) return { ok: false, error: rolesResult.error.message };

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
  if (error) return { ok: false, error: mapUpdateMemberError(error.code, error.message) };

  revalidatePath(ROUTES.TEAM);
  return { ok: true };
}
