'use client';
// Regla 3: 'use client' — lee del contexto el form activo + isDirty/isPending y
// delega el submit a ese <form> vía el atributo HTML `form={id}`.

import { Save } from 'lucide-react';
import { useSettingsSave } from '@/components/settings/save-context';

export function SaveButton() {
  const { formId, isDirty, isPending } = useSettingsSave();
  // Las pestañas Notificaciones y Seguridad no registran form → no se muestra.
  if (!formId) return null;

  return (
    <button
      type="submit"
      form={formId}
      disabled={!isDirty || isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <Save size={14} />
      {isPending ? 'Guardando…' : 'Guardar cambios'}
    </button>
  );
}
