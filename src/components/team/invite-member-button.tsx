'use client';
// Regla 3: 'use client' — maneja estado del diálogo (useState) y lo monta
// condicionalmente para no inicializar react-hook-form hasta abrirlo.

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { InviteMemberDialog } from '@/components/team/invite-member-dialog';
import type { RoleCatalog, DepartmentOption, ManagerOption } from '@/lib/transformers/team';

interface InviteMemberButtonProps {
  roles: RoleCatalog[];
  departments: DepartmentOption[];
  managerOptions: ManagerOption[];
}

export function InviteMemberButton({ roles, departments, managerOptions }: InviteMemberButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full md:w-auto items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:bg-primary/90"
      >
        <UserPlus size={14} />
        Invitar miembro
      </button>

      {open && (
        <InviteMemberDialog
          onClose={() => setOpen(false)}
          roles={roles}
          departments={departments}
          managerOptions={managerOptions}
        />
      )}
    </>
  );
}
