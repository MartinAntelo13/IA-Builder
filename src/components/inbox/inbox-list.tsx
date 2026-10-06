import { Sparkles } from 'lucide-react';
import type { InboxRow } from '@/lib/transformers/inbox';
import { InboxRowItem } from '@/components/inbox/inbox-row';

interface InboxListProps {
  rows: InboxRow[];
  tab: 'pending' | 'reviewed';
}

export function InboxList({ rows, tab }: InboxListProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
        <Sparkles size={28} className="text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">No hay solicitudes en esta vista</p>
          <p className="mt-1 text-2xs text-muted">Prueba con otra pestaña o ajusta tu búsqueda.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {rows.map((row) => (
        <InboxRowItem key={row.requestId} row={row} tab={tab} />
      ))}
    </div>
  );
}
