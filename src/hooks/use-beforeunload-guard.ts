// Regla 3: 'use client' — useEffect con listener window.beforeunload.
'use client';

import { useEffect } from 'react';

/**
 * Muestra el aviso nativo del navegador cuando el usuario intenta recargar o
 * cerrar la página mientras `active` es true. El texto del aviso lo controla
 * el navegador: no se puede personalizar desde hace años, solo activar/desactivar.
 */
export function useBeforeUnloadGuard(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [active]);
}
