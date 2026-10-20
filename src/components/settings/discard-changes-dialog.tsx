// Regla 3: 'use client' — <dialog>.showModal al montar; devuelve el control al
// padre vía onStay/onDiscard (Escape = onStay).
'use client';

import { useEffect, useId, useRef } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/lib/ui/form-classes';

interface DiscardChangesDialogProps {
  onStay: () => void;
  onDiscard: () => void;
}

export function DiscardChangesDialog({ onStay, onDiscard }: DiscardChangesDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-11/12 max-w-md rounded-xl border border-border bg-card shadow-xl p-6 backdrop:bg-black/50"
      onClose={onStay}
    >
      <h2 id={titleId} className="m-0 mb-2 text-foreground text-sm font-semibold tracking-tight">
        ¿Descartar los cambios?
      </h2>
      <p className="m-0 mb-4 text-muted text-2xs leading-relaxed">
        Tenés cambios sin guardar en esta pestaña. Si cambiás de sección, se van a perder.
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onStay}
          autoFocus
          className={`${BTN_PRIMARY} w-full`}
        >
          Seguir editando
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className={`${BTN_SECONDARY} w-full`}
        >
          Descartar cambios
        </button>
      </div>
    </dialog>
  );
}
