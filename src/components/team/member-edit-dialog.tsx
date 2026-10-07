'use client';
// Regla 3: 'use client' — <dialog>.showModal/close + react-hook-form +
// useTransition para disparar la Server Action updateMember.

import { useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSchema, type MemberFormValues } from '@/lib/schemas/member.schema';
import { updateMember } from '@/app/(dashboard)/team/actions';
import type { TeamMember, RoleCatalog, DepartmentOption, ManagerOption } from '@/lib/transformers/team';

interface MemberEditDialogProps {
  onClose: () => void;
  member: TeamMember;
  currentUserId: string | null;
  roles: RoleCatalog[];
  departments: DepartmentOption[];
  managerOptions: ManagerOption[];
}

const INPUT = 'w-full px-3 py-2 rounded-md border border-border bg-white text-xs text-foreground';
const BTN_BASE =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export function MemberEditDialog({ onClose, member, currentUserId, roles, departments, managerOptions }: MemberEditDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSelf = currentUserId === member.id;
  const isInvited = member.status === 'invited';
  const statusLocked = isSelf || isInvited;

  const defaultValues: MemberFormValues = useMemo(() => ({
    jobTitle: member.jobTitle,
    departmentId: member.departmentId,
    managerId: member.managerId,
    roleCodes: [...member.roleCodes],
    status: member.status,
  }), [member]);

  const form = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema), defaultValues, mode: 'onBlur' });
  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = form;

  // Dialogo se monta ya abierto: showModal() al montar y nada que hacer al desmontar.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const departmentId = watch('departmentId');
  const managerId = watch('managerId');
  const roleCodes = watch('roleCodes');

  const availableManagers = managerOptions.filter((m) => m.id !== member.id);
  const statusOptions = isInvited
    ? ([{ value: 'invited', label: 'Pendiente' }] as const)
    : ([{ value: 'active', label: 'Activo' }, { value: 'disabled', label: 'Deshabilitado' }] as const);

  function toggleRole(code: string, checked: boolean) {
    const next = checked ? [...roleCodes, code] : roleCodes.filter((c) => c !== code);
    setValue('roleCodes', next, { shouldDirty: true, shouldValidate: true });
  }

  function onSubmit(values: MemberFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateMember(member.id, values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-11/12 max-w-md rounded-xl border border-border bg-white shadow-xl p-6 backdrop:bg-black/50"
      onClose={onClose}
    >
      <h2 id={titleId} className="m-0 mb-1 text-foreground text-sm font-semibold tracking-tight">
        Editar miembro
      </h2>
      <p className="m-0 mb-4 text-muted text-2xs">{member.fullName}</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <label htmlFor="mem-job" className="block text-2xs font-semibold text-muted mb-1">Cargo</label>
          <input id="mem-job" type="text" {...register('jobTitle')} maxLength={100} className={INPUT} />
          {errors.jobTitle && <p role="alert" className="mt-1 text-2xs text-danger">{errors.jobTitle.message}</p>}
        </div>

        <div>
          <label htmlFor="mem-dept" className="block text-2xs font-semibold text-muted mb-1">Departamento</label>
          <select
            id="mem-dept"
            value={departmentId ?? ''}
            onChange={(e) => setValue('departmentId', e.target.value || null, { shouldDirty: true })}
            className={INPUT}
          >
            <option value="">Sin departamento</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="mem-mgr" className="block text-2xs font-semibold text-muted mb-1">Responsable</label>
          <select
            id="mem-mgr"
            value={managerId ?? ''}
            onChange={(e) => setValue('managerId', e.target.value || null, { shouldDirty: true })}
            className={INPUT}
          >
            <option value="">Sin responsable</option>
            {availableManagers.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
          </select>
        </div>

        <div>
          <p className="block text-2xs font-semibold text-muted mb-1">Roles</p>
          <div className="flex flex-col gap-1.5 p-2 rounded-md border border-border bg-surface">
            {roles.map((role) => {
              const checked = roleCodes.includes(role.code);
              const lockAdmin = isSelf && role.code === 'admin' && checked;
              return (
                <label key={role.id} className={`flex items-center gap-2 text-xs ${lockAdmin ? 'text-muted' : 'text-foreground'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleRole(role.code, e.target.checked)}
                    disabled={lockAdmin}
                  />
                  {role.name}
                </label>
              );
            })}
          </div>
          {errors.roleCodes && <p role="alert" className="mt-1 text-2xs text-danger">{errors.roleCodes.message}</p>}
        </div>

        <div>
          <label htmlFor="mem-status" className="block text-2xs font-semibold text-muted mb-1">Estado</label>
          {statusLocked ? (
            // RHF devuelve undefined para un campo registrado + disabled, lo que
            // hace fallar la validación de zod. Si está bloqueado renderizamos un
            // select sin register: el valor queda en el form state vía defaultValues.
            <select id="mem-status" defaultValue={member.status} disabled className={INPUT}>
              {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          ) : (
            <select id="mem-status" {...register('status')} className={INPUT}>
              {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          )}
        </div>

        {isSelf && (
          <p className="text-2xs text-muted">
            No podés cambiar tu propio estado ni quitarte el rol de administrador.
          </p>
        )}

        {serverError && <p role="alert" className="text-2xs text-danger">{serverError}</p>}

        <div className="flex flex-col gap-2 mt-2">
          <button type="submit" disabled={!isDirty || isPending} className={`${BTN_BASE} bg-primary text-primary-foreground`}>
            {isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={onClose} disabled={isPending} className={`${BTN_BASE} border border-border text-muted bg-white`}>
            Cancelar
          </button>
        </div>
      </form>
    </dialog>
  );
}
