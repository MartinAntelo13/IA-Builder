'use client';
// Regla 3: 'use client' — <dialog>.showModal + useTransition para disparar la
// Server Action revokeInvitedMember.

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { revokeInvitedMember } from '@/app/(dashboard)/team/invite-actions';
import type { TeamMember } from '@/lib/transformers/team';

interface MemberRevokeDialogProps {
  onClose: () => void;
  member: TeamMember;
}

const BTN_BASE =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export function MemberRevokeDialog({ onClose, member }: MemberRevokeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Diálogo montado abierto: showModal() al montar; onClose desmonta.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function onConfirm() {
    setServerError(null);
    startTransition(async () => {
      const result = await revokeInvitedMember(member.id);
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
        Revocar invitación
      </h2>
      <p className="m-0 mb-4 text-muted text-2xs leading-relaxed">
        Se eliminará la invitación de{' '}
        <strong className="text-foreground">{member.fullName}</strong> ({member.email}). Vas a
        poder invitarlo de nuevo más adelante.
      </p>

      {serverError && (
        <div role="alert" className="mb-3 p-2.5 bg-danger-bg rounded text-2xs text-danger">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          className={`${BTN_BASE} bg-danger text-white`}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? 'Revocando…' : 'Revocar'}
        </button>
        <button
          className={`${BTN_BASE} border border-border text-muted bg-white`}
          onClick={onClose}
          disabled={isPending}
        >
          Volver
        </button>
      </div>
    </dialog>
  );
}
