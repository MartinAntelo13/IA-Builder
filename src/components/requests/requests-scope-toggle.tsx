import Link from 'next/link';
import { requestsListHref } from '@/lib/routes';

interface RequestsScopeToggleProps {
  currentScope: 'mine' | 'all';
  q?: string;
  showLimitedHint?: boolean;
}

function linkClasses(active: boolean): string {
  const base = 'px-3 py-1.5 rounded-md text-2xs font-medium transition-colors';
  return active
    ? `${base} bg-primary/10 text-primary font-bold`
    : `${base} text-muted hover:text-foreground`;
}

export function RequestsScopeToggle({ currentScope, q, showLimitedHint }: RequestsScopeToggleProps) {
  return (
    <div className="mb-3">
      <nav aria-label="Alcance de solicitudes" className="flex gap-1">
        <Link
          href={requestsListHref({ q })}
          aria-current={currentScope === 'mine' ? 'page' : undefined}
          className={linkClasses(currentScope === 'mine')}
        >
          Mías
        </Link>
        <Link
          href={requestsListHref({ scope: 'all', q })}
          aria-current={currentScope === 'all' ? 'page' : undefined}
          className={linkClasses(currentScope === 'all')}
        >
          Todas
        </Link>
      </nav>
      {showLimitedHint && (
        <p className="mt-1.5 text-2xs text-muted">
          Mostrando tus solicitudes y aquellas en las que participás.
        </p>
      )}
    </div>
  );
}
