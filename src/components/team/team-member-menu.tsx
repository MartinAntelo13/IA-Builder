'use client';
// Regla 3: 'use client' — maneja estado del menú (useState) y click-outside
// (useEffect + useRef). Los diálogos hijos invocan Server Actions.

import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { MemberEditDialog } from '@/components/team/member-edit-dialog';
import { MemberStatusDialog } from '@/components/team/member-status-dialog';
import type {
  TeamMember,
  RoleCatalog,
  DepartmentOption,
  ManagerOption,
} from '@/lib/transformers/team';

interface TeamMemberMenuProps {
  member: TeamMember;
  currentUserId: string | null;
  roles: RoleCatalog[];
  departments: DepartmentOption[];
  managerOptions: ManagerOption[];
}

type DialogKind = null | 'edit' | 'disable' | 'enable';

export function TeamMemberMenu({
  member,
  currentUserId,
  roles,
  departments,
  managerOptions,
}: TeamMemberMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const canToggleStatus = member.status !== 'invited';
  const toggleAction: 'disable' | 'enable' = member.status === 'disabled' ? 'enable' : 'disable';
  const toggleLabel = toggleAction === 'disable' ? 'Deshabilitar' : 'Reactivar';
  // No podés deshabilitarte a vos mismo (lo rechaza el RPC); el item queda inhabilitado.
  const selfDisableBlocked = toggleAction === 'disable' && currentUserId === member.id;

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        className="grid place-items-center w-8 h-8 rounded-md text-muted hover:bg-border cursor-pointer"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label="Acciones de miembro"
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-40 bg-white border border-border rounded-lg shadow-md z-10 py-1">
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-2xs text-foreground hover:bg-surface cursor-pointer"
            onClick={() => {
              setMenuOpen(false);
              setDialog('edit');
            }}
          >
            Editar miembro
          </button>
          {canToggleStatus && (
            <button
              type="button"
              disabled={selfDisableBlocked}
              className={
                toggleAction === 'disable'
                  ? 'w-full px-4 py-2 text-left text-2xs text-danger hover:bg-danger-bg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'w-full px-4 py-2 text-left text-2xs text-foreground hover:bg-surface cursor-pointer'
              }
              onClick={() => {
                setMenuOpen(false);
                setDialog(toggleAction);
              }}
            >
              {toggleLabel}
            </button>
          )}
        </div>
      )}

      {dialog === 'edit' && (
        <MemberEditDialog
          onClose={() => setDialog(null)}
          member={member}
          currentUserId={currentUserId}
          roles={roles}
          departments={departments}
          managerOptions={managerOptions}
        />
      )}
      {dialog === 'disable' && (
        <MemberStatusDialog
          onClose={() => setDialog(null)}
          member={member}
          action="disable"
        />
      )}
      {dialog === 'enable' && (
        <MemberStatusDialog
          onClose={() => setDialog(null)}
          member={member}
          action="enable"
        />
      )}
    </div>
  );
}
