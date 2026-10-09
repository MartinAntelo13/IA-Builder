'use client';
// Regla 3: 'use client' — useState para el buscador y el filtro de estado
// (interactividad en el toolbar, filtrado client-side sobre el set paginado).

import { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import type { RequestRow } from '@/lib/transformers/requests';
import { RequestRowItem } from '@/components/requests/request-row';

interface RequestsSectionProps {
  requests: RequestRow[];
  variant?: 'dashboard' | 'list';
}

const STATUS_TABS = [
  { value: null as string | null, label: 'Todas' },
  { value: 'submitted', label: 'Enviadas' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'changes_requested', label: 'Cambios solicitados' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
];

export function RequestsSection({ requests, variant = 'list' }: RequestsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isDashboard = variant === 'dashboard';

  const q = searchQuery.toLowerCase();
  const filtered = requests.filter((r) => {
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.requesterName.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="overflow-hidden bg-white border border-border rounded-lg shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-foreground">Solicitudes recientes</h2>
        {isDashboard && (
          <p className="mt-0.5 text-2xs text-muted">
            Gestiona y da seguimiento a las solicitudes de tu equipo.
          </p>
        )}
      </div>

      <div className="px-4 pb-3 border-b border-border flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 h-8 px-2.5 bg-surface border border-border rounded-md w-full sm:w-56">
          <Search size={14} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 outline-none bg-transparent text-2xs text-foreground placeholder:text-muted"
          />
        </div>

        {isDashboard && (
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value ?? 'all'}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`text-2xs px-2.5 py-2 rounded-md border-0 transition-colors ${
                    active
                      ? 'text-primary bg-primary/10 font-bold'
                      : 'text-muted bg-transparent hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div>
          {filtered.map((row) => (
            <RequestRowItem key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <FileText size={36} className="text-muted mb-3" />
          <p className="text-xs text-muted">No hay solicitudes que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}
