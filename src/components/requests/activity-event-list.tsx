'use client';
// Client Component: controla la expansión in-place de la lista de actividad

import { useState } from 'react';

export interface ActivityItem {
  id: string;
  title: string;
  meta: string;
}

interface ActivityEventListProps {
  items: ActivityItem[];
  initialCount?: number;
}

export function ActivityEventList({ items, initialCount = 5 }: ActivityEventListProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(-initialCount);
  return (
    <>
      <div className="flex flex-col">
        {visible.map((item) => (
          <div key={item.id} className="flex gap-2.5 py-3.5 border-b border-border first:pt-0 last:pb-0 last:border-b-0">
            <div className="w-1.5 h-1.5 mt-1 rounded-full bg-primary shrink-0" />
            <div>
              <strong className="block text-foreground text-2xs font-bold">{item.title}</strong>
              <small className="block mt-0.5 text-muted text-2xs">{item.meta}</small>
            </div>
          </div>
        ))}
      </div>
      {items.length > initialCount && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 text-primary text-2xs font-semibold"
        >
          {expanded ? 'Ver menos' : `Ver todo (${items.length})`}
        </button>
      )}
    </>
  );
}
