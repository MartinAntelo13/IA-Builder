'use client';
// Regla 3: 'use client' — <dialog>.showModal + react-hook-form + useTransition
// para disparar la Server Action inviteMember.

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteSchema, type InviteFormValues } from '@/lib/schemas/invite.schema';
import { inviteMember } from '@/app/(dashboard)/team/invite-actions';
import type { RoleCatalog, DepartmentOption, ManagerOption } from '@/lib/transformers/team';

interface InviteMemberDialogProps {
  onClose: () => void;
  roles: RoleCatalog[];
  departments: DepartmentOption[];
  managerOptions: ManagerOption[];
}

const INPUT = 'w-full px-3 py-2 rounded-md border border-border bg-white text-xs text-foreground';
const BTN_BASE =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export function InviteMemberDialog({ onClose, roles, departments, managerOptions }: InviteMemberDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      fullName: '',
      // Default: rol de menor privilegio ('requester'); si no está, el primero del catálogo.
      roleCode: roles.find((r) => r.code === 'requester')?.code ?? roles[0]?.code ?? '',
      jobTitle: '',
      departmentId: null,
      managerId: null,
    },
    mode: 'onBlur',
  });
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  // Diálogo montado abierto: showModal() al montar; onClose llamado por Escape,
  // Cancelar o éxito desmonta el componente desde el padre.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const roleCode = watch('roleCode');
  const departmentId = watch('departmentId');
  const managerId = watch('managerId');

  function onSubmit(values: InviteFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await inviteMember(values);
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
        Invitar miembro
      </h2>
      <p className="m-0 mb-4 text-muted text-2xs">
        Enviale un link para que active su cuenta en Flowdesk.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <label htmlFor="inv-email" className="block text-2xs font-semibold text-muted mb-1">Email</label>
          <input id="inv-email" type="email" autoComplete="email" {...register('email')} className={INPUT} />
          {errors.email && <p role="alert" className="mt-1 text-2xs text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="inv-name" className="block text-2xs font-semibold text-muted mb-1">Nombre completo</label>
          <input id="inv-name" type="text" maxLength={100} {...register('fullName')} className={INPUT} />
          {errors.fullName && <p role="alert" className="mt-1 text-2xs text-danger">{errors.fullName.message}</p>}
        </div>

        <div>
          <label htmlFor="inv-role" className="block text-2xs font-semibold text-muted mb-1">Rol inicial</label>
          <select
            id="inv-role"
            value={roleCode}
            onChange={(e) => setValue('roleCode', e.target.value, { shouldDirty: true, shouldValidate: true })}
            className={INPUT}
          >
            {roles.map((r) => <option key={r.id} value={r.code}>{r.name}</option>)}
          </select>
          <p className="mt-1 text-2xs text-muted">
            Podés agregarle más roles después desde "Editar miembro".
          </p>
          {errors.roleCode && <p role="alert" className="mt-1 text-2xs text-danger">{errors.roleCode.message}</p>}
        </div>

        <div>
          <label htmlFor="inv-job" className="block text-2xs font-semibold text-muted mb-1">Cargo (opcional)</label>
          <input id="inv-job" type="text" maxLength={100} {...register('jobTitle')} className={INPUT} />
          {errors.jobTitle && <p role="alert" className="mt-1 text-2xs text-danger">{errors.jobTitle.message}</p>}
        </div>

        <div>
          <label htmlFor="inv-dept" className="block text-2xs font-semibold text-muted mb-1">Departamento (opcional)</label>
          <select
            id="inv-dept"
            value={departmentId ?? ''}
            onChange={(e) => setValue('departmentId', e.target.value || null, { shouldDirty: true })}
            className={INPUT}
          >
            <option value="">Sin departamento</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="inv-mgr" className="block text-2xs font-semibold text-muted mb-1">Responsable (opcional)</label>
          <select
            id="inv-mgr"
            value={managerId ?? ''}
            onChange={(e) => setValue('managerId', e.target.value || null, { shouldDirty: true })}
            className={INPUT}
          >
            <option value="">Sin responsable</option>
            {managerOptions.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
          </select>
        </div>

        {serverError && <p role="alert" className="text-2xs text-danger">{serverError}</p>}

        <div className="flex flex-col gap-2 mt-2">
          <button type="submit" disabled={isPending} className={`${BTN_BASE} bg-primary text-primary-foreground`}>
            {isPending ? 'Enviando…' : 'Enviar invitación'}
          </button>
          <button type="button" onClick={onClose} disabled={isPending} className={`${BTN_BASE} border border-border text-muted bg-white`}>
            Cancelar
          </button>
        </div>
      </form>
    </dialog>
  );
}
