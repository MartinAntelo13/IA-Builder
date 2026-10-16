// Regla 3: 'use client' — useFormStatus para deshabilitar el botón mientras corre la Server Action.
'use client';

import { useFormStatus } from 'react-dom';
import { LogOut } from 'lucide-react';
import { signOut } from '@/app/(dashboard)/settings/security-actions';

export function SidebarSignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden md:inline">Cerrar sesión</span>
    </button>
  );
}
