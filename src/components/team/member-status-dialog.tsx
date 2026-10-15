'use client';
// Regla 3: 'use client' — <dialog>.showModal + useTransition para disparar la
// Server Action setMemberStatus.

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setMemberStatus } from '@/app/(dashboard)/team/actions';
import type { TeamMember } from '@/lib/transformers/team';
import { CriticalRolesWarning } from '@/components/team/critical-roles-warning';

interface MemberStatusDialogProps {
  onClose: () => void;
  member: TeamMember;
  action: 'disable' | 'enable';
  // Roles del miembro que, al deshabilitarlo, dejarían sin cobertura a algún
  // workflow activo. Vacío/undefined → no se muestra el aviso específico.
  criticalRoleNames?: string[];
}

const BTN_BASE =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

// Cuando hay roles críticos no mostramos la frase genérica ("Si es la única
// con alguno de sus roles…") porque el aviso específico de abajo ya cubre ese
// caso con los nombres reales.
const DISABLE_DESCRIPTION_GENERIC =
  'Esta persona no podrá iniciar sesión ni usar Flowdesk. Si es la única con alguno de sus roles, las solicitudes que lleguen a ese paso no podrán avanzar.';
const DISABLE_DESCRIPTION_SHORT =
  'Esta persona no podrá iniciar sesión ni usar Flowdesk.';

const COPY = {
  enable: {
    title: 'Reactivar miembro',
    description: 'Podrá volver a iniciar sesión.',
    confirm: 'Reactivar',
    pending: 'Reactivando…',
    destructive: false,
  },
  disable: {
    title: 'Deshabilitar miembro',
    confirm: 'Deshabilitar',
    pending: 'Deshabilitando…',
    destructive: true,
  },
} as const;

export function MemberStatusDialog({ onClose, member, action, criticalRoleNames = [] }: MemberStatusDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Dialogo se monta ya abierto: showModal() al montar y nada que hacer al desmontar.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const newStatus = action === 'disable' ? 'disabled' : 'active';
  const hasCriticalRoles = action === 'disable' && criticalRoleNames.length > 0;
  const title = action === 'disable' ? COPY.disable.title : COPY.enable.title;
  const confirmLabel = action === 'disable' ? COPY.disable.confirm : COPY.enable.confirm;
  const pendingLabel = action === 'disable' ? COPY.disable.pending : COPY.enable.pending;
  const destructive = action === 'disable' ? COPY.disable.destructive : COPY.enable.destructive;
  const description =
    action === 'enable'
      ? COPY.enable.description
      : hasCriticalRoles
        ? DISABLE_DESCRIPTION_SHORT
        : DISABLE_DESCRIPTION_GENERIC;

  function onConfirm() {
    setServerError(null);
    startTransition(async () => {
      const result = await setMemberStatus(member.id, newStatus);
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
      onCancel={(e) => { if (isPending) e.preventDefault(); }}
    >
      <h2 id={titleId} className="m-0 mb-2 text-foreground text-sm font-semibold tracking-tight">
        {title}
      </h2>
      <p className="m-0 mb-2 text-foreground text-xs font-medium">{member.fullName}</p>
      <p className="m-0 mb-4 text-muted text-2xs leading-relaxed">{description}</p>

      {hasCriticalRoles && <CriticalRolesWarning names={criticalRoleNames} mode="disable" />}

      {serverError && (
        <div role="alert" className="mb-3 p-2.5 bg-danger-bg rounded text-2xs text-danger">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          className={`${BTN_BASE} ${destructive ? 'bg-danger text-white' : 'bg-primary text-primary-foreground'}`}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? pendingLabel : confirmLabel}
        </button>
        <button
          className={`${BTN_BASE} border border-border text-muted bg-white`}
          onClick={onClose}
          disabled={isPending}
        >
          Cancelar
        </button>
      </div>
    </dialog>
  );
}
