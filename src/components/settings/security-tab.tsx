'use client';
// Regla 3: 'use client' — abre diálogos (useState) para cambiar contraseña y
// cerrar sesiones. Los diálogos se montan solo cuando están abiertos.

import { useState } from 'react';
import { KeyRound, LockKeyhole, UserRound } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/settings/change-password-dialog';
import { SignOutOthersDialog } from '@/components/settings/sign-out-others-dialog';

interface SecurityTabProps {
  lastSignInLabel: string;
}

type DialogKind = null | 'password' | 'sign-out-others';

export function SecurityTab({ lastSignInLabel }: SecurityTabProps) {
  const [dialog, setDialog] = useState<DialogKind>(null);

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Seguridad y acceso</h2>
          <p className="mt-1 text-2xs text-muted">
            Protegé tu cuenta y revisá los métodos de acceso.
          </p>
        </div>
        <LockKeyhole size={20} className="text-primary shrink-0" aria-hidden="true" />
      </div>

      <div className="h-px bg-border my-5" />

      <ul className="divide-y divide-border">
        <li className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <KeyRound size={18} className="text-muted mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Contraseña</p>
              <p className="mt-0.5 text-2xs text-muted">
                Último inicio de sesión: {lastSignInLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDialog('password')}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-2xs font-semibold text-foreground bg-white hover:bg-surface cursor-pointer"
          >
            Cambiar
          </button>
        </li>

        <li className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <UserRound size={18} className="text-muted mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Sesiones</p>
              <p className="mt-0.5 text-2xs text-muted">
                Cerrá tu sesión en todos los otros dispositivos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDialog('sign-out-others')}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-2xs font-semibold text-foreground bg-white hover:bg-surface cursor-pointer"
          >
            Cerrar en otros
          </button>
        </li>
      </ul>

      {dialog === 'password' && (
        <ChangePasswordDialog onClose={() => setDialog(null)} />
      )}
      {dialog === 'sign-out-others' && (
        <SignOutOthersDialog onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
