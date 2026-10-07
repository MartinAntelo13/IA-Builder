'use client';
// Regla 3: 'use client' — <dialog>.showModal + useTransition para disparar la
// Server Action setMemberStatus.

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setMemberStatus } from '@/app/(dashboard)/team/actions';
import type { TeamMember } from '@/lib/transformers/team';

interface MemberStatusDialogProps {
  onClose: () => void;
  member: TeamMember;
  action: 'disable' | 'enable';
}

const BTN_BASE =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

const COPY = {
  disable: {
    title: 'Deshabilitar miembro',
    description:
      'Esta persona no podrá iniciar sesión ni usar Flowdesk. Si es la única con alguno de sus roles, las solicitudes que lleguen a ese paso no podrán avanzar.',
    confirm: 'Deshabilitar',
    pending: 'Deshabilitando…',
    destructive: true,
  },
  enable: {
    title: 'Reactivar miembro',
    description: 'Podrá volver a iniciar sesión.',
    confirm: 'Reactivar',
    pending: 'Reactivando…',
    destructive: false,
  },
} as const;

export function MemberStatusDialog({ onClose, member, action }: MemberStatusDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Dialogo se monta ya abierto: showModal() al montar y nada que hacer al desmontar.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const copy = COPY[action];
  const newStatus = action === 'disable' ? 'disabled' : 'active';

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
    >
      <h2 id={titleId} className="m-0 mb-2 text-foreground text-sm font-semibold tracking-tight">
        {copy.title}
      </h2>
      <p className="m-0 mb-2 text-foreground text-xs font-medium">{member.fullName}</p>
      <p className="m-0 mb-4 text-muted text-2xs leading-relaxed">{copy.description}</p>

      {serverError && (
        <div role="alert" className="mb-3 p-2.5 bg-danger-bg rounded text-2xs text-danger">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          className={`${BTN_BASE} ${copy.destructive ? 'bg-danger text-white' : 'bg-primary text-primary-foreground'}`}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? copy.pending : copy.confirm}
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
