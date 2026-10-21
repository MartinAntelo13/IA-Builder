// Regla 3: 'use client' — cierra un menú al hacer click afuera o presionar Escape;
// opcionalmente al perder el foco hacia afuera y devolviendo el foco a un elemento.
'use client';

import { useEffect, useRef, type RefObject } from 'react';

interface UseDismissableOptions {
  open: boolean;
  onDismiss: () => void;
  containerRef: RefObject<HTMLElement | null>;
  closeOnFocusOutside?: boolean;
  restoreFocusRef?: RefObject<HTMLElement | null>;
}

export function useDismissable({
  open,
  onDismiss,
  containerRef,
  closeOnFocusOutside = false,
  restoreFocusRef,
}: UseDismissableOptions): void {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!open) return;
    function isOutside(target: EventTarget | null): boolean {
      const container = containerRef.current;
      return container !== null && target instanceof Node && !container.contains(target);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      onDismissRef.current();
      restoreFocusRef?.current?.focus();
    }
    function onMouseDown(e: MouseEvent) {
      if (isOutside(e.target)) onDismissRef.current();
    }
    function onFocusIn(e: FocusEvent) {
      if (isOutside(e.target)) onDismissRef.current();
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    if (closeOnFocusOutside) document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
      if (closeOnFocusOutside) document.removeEventListener('focusin', onFocusIn);
    };
  }, [open, containerRef, closeOnFocusOutside, restoreFocusRef]);
}
