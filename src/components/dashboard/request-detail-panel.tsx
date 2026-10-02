// 'use client' - requires useState for menu state management
'use client';

import { useState } from 'react';
import { X, Check, XCircle, Clock3, FileText, MoreHorizontal, Paperclip, ChevronDown } from 'lucide-react';
import { REQUEST_STATUS_STYLES } from '@/constants';
// EXCEPTION (Regla 7): la RPC get_request_detail (Database['public']['Functions']
// ['get_request_detail']) devuelve `Returns: Json` sin shape tipado, porque Postgres
// no puede describir en los tipos generados la forma de un jsonb_build_object().
// Esa RPC todavía no se invoca ni se parsea en ningún lugar del código (no existe un
// transformer dedicado, a diferencia de transformRequestRow para list_requests).
// `Json` por sí solo no sería suficientemente específico para este componente, así que
// en vez de inventar una interface nueva a mano reutilizamos RequestRow: es exactamente
// el mismo shape camelCase de 11 campos que este panel ya esperaba, y es el tipo que se
// usará naturalmente el día que se escriba un transformer para get_request_detail.
import type { RequestRow } from '@/lib/transformers/requests';

interface RequestDetailPanelProps {
  request: RequestRow | null;
  onClose: () => void;
}

export function RequestDetailPanel({ request, onClose }: RequestDetailPanelProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!request) {
    return null;
  }

  const statusStyle = REQUEST_STATUS_STYLES[request.status];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {request.code} {request.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Solicitante: {request.requesterName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1 px-2 rounded text-xs font-medium ${statusStyle?.badge || ''}`}
          >
            <span className={statusStyle?.dot || ''} />
            {statusStyle?.label || request.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tipo</span>
            <span className="text-sm font-medium">{request.requestTypeName || '—'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Importe</span>
            <span className="text-sm font-medium">
              {request.amount !== null && request.currencySymbol 
                ? `${request.currencySymbol} ${request.amount.toLocaleString()}`
                : '—'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fecha</span>
            <span className="text-sm font-medium">
              {request.submittedAt ? 
                new Date(request.submittedAt).toLocaleDateString('es-ES') 
                : '—'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Paso actual</span>
            <span className="text-sm font-medium">{request.currentStepLabel || '—'}</span>
          </div>
        </div>

        {/* Actions (Fase 4) */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-muted-foreground mb-3">
            Acciones disponibles (Fase 4)
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
              disabled
            >
              <Check className="h-4 w-4" />
              Aprobar
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
              disabled
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}