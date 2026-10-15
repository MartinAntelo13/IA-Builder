// Regla 3: 'use client' — error boundary raíz; atrapa errores de layouts anidados bajo (dashboard).
'use client';

import { ErrorPanel } from '@/components/shared/error-panel';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  return (
    <ErrorPanel
      title="No se pudo cargar la aplicación"
      error={error}
      reset={reset}
      wrapperClassName="min-h-screen justify-center"
    />
  );
}
