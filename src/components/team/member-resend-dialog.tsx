'use client';
// Regla 3: 'use client' — <dialog>.showModal + useTransition para disparar la
// Server Action resendInvitation.

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { resendInvitation } from '@/app/(dashboard)/team/resend-actions';
import type { TeamMember } from '@/lib/transformers/team';

interface MemberResendDialogProps {
  onClose: () => void;
  member: TeamMember;
}

const BTN_BASE =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export function MemberResendDialog({ onClose, member }: MemberResendDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'confirm' | 'success'>('confirm');
  const [sentEmail, setSentEmail] = useState('');

  // Diálogo montado abierto: showModal() al montar; onClose desmonta.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function onConfirm() {
    setServerError(null);
    startTransition(async () => {
      const result = await resendInvitation(member.id);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      // Capturar el email ANTES de cambiar de estado: member.email podría ser
      // null en el tipo y la UI de success lo muestra textual.
      setSentEmail(member.email ?? '');
      setStatus('success');
      router.refresh();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-11/12 max-w-md rounded-xl border border-border bg-card shadow-xl p-6 backdrop:bg-black/50"
      onClose={onClose}
      onCancel={(e) => { if (isPending) e.preventDefault(); }}
    >
      <h2 id={titleId} className="m-0 mb-2 text-foreground text-sm font-semibold tracking-tight">
        Reenviar invitación
      </h2>

      {status === 'success' ? (
        <>
          <div role="status" className="mb-4 p-3 bg-success-bg rounded text-2xs text-success leading-relaxed">
            Invitación reenviada a <strong className="font-semibold">{sentEmail}</strong>.
          </div>
          <button type="button" onClick={onClose} className={`${BTN_BASE} bg-primary text-primary-foreground`} autoFocus>
            Cerrar
          </button>
        </>
      ) : (
        <>
          <p className="m-0 mb-4 text-muted text-2xs leading-relaxed">
            Se enviará un nuevo mail de invitación a{' '}
            <strong className="text-foreground">{member.fullName}</strong> ({member.email}).
          </p>

          {serverError && (
            <div role="alert" className="mb-3 p-2.5 bg-danger-bg rounded text-2xs text-danger">
              {serverError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={`${BTN_BASE} bg-primary text-primary-foreground`}
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? 'Enviando…' : 'Reenviar'}
            </button>
            <button
              type="button"
              className={`${BTN_BASE} border border-border text-muted bg-card`}
              onClick={onClose}
              disabled={isPending}
            >
              Volver
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
