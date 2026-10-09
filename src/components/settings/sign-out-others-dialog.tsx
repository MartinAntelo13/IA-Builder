'use client';
// Regla 3: 'use client' — <dialog>.showModal + useTransition para la Server
// Action signOutOtherSessions. Sin RHF (no hay campos de entrada).

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { signOutOtherSessions } from '@/app/(dashboard)/settings/security-actions';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/lib/ui/form-classes';

interface SignOutOthersDialogProps {
  onClose: () => void;
}

export function SignOutOthersDialog({ onClose }: SignOutOthersDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function onConfirm() {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await signOutOtherSessions();
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setSuccess(true);
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
        Cerrar sesión en otros dispositivos
      </h2>
      <p className="m-0 mb-4 text-muted text-2xs leading-relaxed">
        Vas a invalidar todas tus sesiones activas, excepto la que estás usando
        ahora. Si querés volver a entrar en otro dispositivo, vas a necesitar
        iniciar sesión de nuevo.
      </p>

      {serverError && (
        <div role="alert" className="mb-3 p-2.5 bg-danger-bg rounded text-2xs text-danger">
          {serverError}
        </div>
      )}
      {success && !serverError && (
        <div role="status" className="mb-3 p-2.5 bg-success-bg rounded text-2xs text-success">
          Se cerraron las otras sesiones.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending || success}
          className={`${BTN_PRIMARY} w-full`}
        >
          {isPending ? 'Cerrando…' : 'Cerrar otras sesiones'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className={`${BTN_SECONDARY} w-full`}
        >
          {success ? 'Cerrar' : 'Cancelar'}
        </button>
      </div>
    </dialog>
  );
}
