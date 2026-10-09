'use client';
// Regla 3: 'use client' — React context + hooks para que el botón "Guardar
// cambios" del header pueda submitear el <form> de la pestaña activa.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface SaveFormState {
  formId: string | null;
  isDirty: boolean;
  isPending: boolean;
}

interface SaveContextValue extends SaveFormState {
  setFormState: (state: SaveFormState) => void;
}

const SaveCtx = createContext<SaveContextValue | null>(null);

export function SettingsSaveProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SaveFormState>({
    formId: null,
    isDirty: false,
    isPending: false,
  });
  const value = useMemo<SaveContextValue>(
    () => ({ ...state, setFormState: setState }),
    [state],
  );
  return <SaveCtx.Provider value={value}>{children}</SaveCtx.Provider>;
}

export function useSettingsSave(): SaveContextValue {
  const ctx = useContext(SaveCtx);
  if (!ctx) throw new Error('useSettingsSave debe estar dentro de SettingsSaveProvider');
  return ctx;
}
