'use client';
// Client Component: usa useState para el texto del comentario y useTransition para el envío

import { useState, useTransition } from 'react';
import { SendHorizonal } from 'lucide-react';
import { addComment } from '@/app/(dashboard)/requests/[id]/actions';

interface RequestCommentFormProps {
  requestId: string;
  userInitials: string;
}

export function RequestCommentForm({ requestId, userInitials }: RequestCommentFormProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = text.trim().length > 0 && !isPending;

  function handleSubmit() {
    if (!canSubmit) return;
    const value = text;
    setError(null);
    startTransition(async () => {
      const result = await addComment(requestId, value);
      if (!result.ok) {
        setError(result.error);
      } else {
        setText('');
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="pt-4 mt-4 border-t border-border">
      {error && (
        <p role="alert" className="mb-2 text-2xs text-danger">
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-2xs font-bold grid place-items-center shrink-0">
          {userInitials}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={5000}
          placeholder="Escribe un comentario..."
          disabled={isPending}
          className="flex-1 min-w-0 h-8 px-3 text-2xs border border-border rounded-md outline-none focus:border-primary disabled:opacity-60 bg-white text-foreground placeholder:text-muted"
        />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="Enviar comentario"
          className="w-8 h-8 grid place-items-center rounded-md bg-primary text-primary-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <SendHorizonal size={14} />
        </button>
      </div>
    </div>
  );
}
