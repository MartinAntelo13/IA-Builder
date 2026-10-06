'use client';
// Client Component: uses useRef to call showModal/close on native <dialog>, useState for textarea

import { useEffect, useId, useRef, useState } from 'react';

interface RequestActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  fieldLabel?: string;
  required?: boolean;
  confirmText: string;
  onConfirm: (comment: string) => void;
  isPending: boolean;
  error?: string | null;
  cancelLabel?: string;
  destructive?: boolean;
  hideField?: boolean;
}

const BTN_BASE =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export function RequestActionDialog({
  open,
  onClose,
  title,
  description,
  fieldLabel = '',
  required = false,
  confirmText,
  onConfirm,
  isPending,
  error,
  cancelLabel = 'Cancelar',
  destructive = false,
  hideField = false,
}: RequestActionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState('');
  const titleId = useId();

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      setText('');
    }
  }, [open]);

  const canConfirm = !isPending && (hideField || !required || text.trim().length > 0);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-11/12 max-w-md rounded-xl border border-border bg-white shadow-xl p-6 backdrop:bg-black/50"
      onClose={onClose}
    >
      <h2 id={titleId} className="m-0 mb-2 text-foreground text-sm font-semibold tracking-tight">
        {title}
      </h2>
      <p className="m-0 mb-4 text-muted text-2xs leading-relaxed">{description}</p>

      {error && (
        <div role="alert" className="mb-3 p-2.5 bg-danger-bg rounded text-2xs text-danger">
          {error}
        </div>
      )}

      {!hideField && (
        <label className="block mb-4">
          <span className="block mb-1.5 text-2xs font-bold text-muted">
            {fieldLabel}
            {required && <span className="text-danger ml-0.5">*</span>}
          </span>
          <textarea
            className="w-full min-h-24 px-3 py-2 border border-border rounded-md text-2xs text-foreground resize-y outline-none focus:border-primary"
            maxLength={5000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPending}
            aria-required={required}
          />
        </label>
      )}

      <div className="flex flex-col gap-2">
        <button
          className={`${BTN_BASE} ${destructive ? 'bg-danger text-white' : 'bg-primary text-primary-foreground'}`}
          onClick={() => onConfirm(text)}
          disabled={!canConfirm}
        >
          {isPending ? 'Enviando…' : confirmText}
        </button>
        <button
          className={`${BTN_BASE} border border-border text-muted`}
          onClick={onClose}
          disabled={isPending}
        >
          {cancelLabel}
        </button>
      </div>
    </dialog>
  );
}
