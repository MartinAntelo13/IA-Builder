// Regla 3: 'use client' — useTransition + useRouter para duplicar una solicitud y navegar al resultado.
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
import { duplicateRequest } from '@/app/(dashboard)/requests/[id]/duplicate-actions';
import { requestDetailHref } from '@/lib/routes';

interface DuplicateRequestButtonProps {
  requestId: string;
}

export function DuplicateRequestButton({ requestId }: DuplicateRequestButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await duplicateRequest(requestId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(requestDetailHref(result.requestId));
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label="Duplicar solicitud"
        title="Duplicar solicitud"
        className="grid place-items-center w-8 h-8 rounded-md text-muted hover:bg-border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Copy size={16} />
      </button>
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-full mt-1 z-10 w-64 rounded-md border border-border bg-surface px-3 py-2 text-2xs text-danger shadow-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}
