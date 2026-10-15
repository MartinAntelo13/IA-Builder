// Regla 3: 'use client' — el botón Cancelar lleva onClick y se usa dentro del <form>
// de member-edit-dialog (Client Component).
'use client';

const BTN_BASE =
  'w-full flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

interface MemberEditDialogFooterProps {
  isDirty: boolean;
  isPending: boolean;
  onCancel: () => void;
}

export function MemberEditDialogFooter({ isDirty, isPending, onCancel }: MemberEditDialogFooterProps) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <button type="submit" disabled={!isDirty || isPending} className={`${BTN_BASE} bg-primary text-primary-foreground`}>
        {isPending ? 'Guardando…' : 'Guardar cambios'}
      </button>
      <button type="button" onClick={onCancel} disabled={isPending} className={`${BTN_BASE} border border-border text-muted bg-white`}>
        Cancelar
      </button>
    </div>
  );
}
