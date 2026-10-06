// 'use client' - requires useState for row selection and status filtering,
// plus onClick event handlers for interactive table rows
'use client';

import { useState } from 'react';
import { FileText, MoreHorizontal, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { REQUEST_STATUS_STYLES } from '@/constants';
import type { RequestRow } from '@/lib/transformers/requests';
import { formatCurrency } from '@/lib/format-helpers';

interface RequestsTableProps {
  requests: RequestRow[];
  totalCount: number;
  isDashboard?: boolean;
  onRequestSelect?: (request: RequestRow) => void;
  onStatusFilterChange?: (status: string | null) => void;
}

export function RequestsTable({
  requests,
  totalCount,
  isDashboard = false,
  onRequestSelect,
  onStatusFilterChange,
}: RequestsTableProps) {
  const [selectedRow, setSelectedRow] = useState<RequestRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar por búsqueda y estado
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Tabs de filtro por status (solo en dashboard)
  const statusTabs = isDashboard
    ? [
        { value: null, label: 'Todas', count: filteredRequests.length },
        { value: 'submitted', label: 'Enviadas', count: filteredRequests.filter(r => r.status === 'submitted').length },
        { value: 'in_review', label: 'En revisión', count: filteredRequests.filter(r => r.status === 'in_review').length },
        { value: 'changes_requested', label: 'Cambios solicitados', count: filteredRequests.filter(r => r.status === 'changes_requested').length },
        { value: 'approved', label: 'Aprobadas', count: filteredRequests.filter(r => r.status === 'approved').length },
        { value: 'rejected', label: 'Rechazadas', count: filteredRequests.filter(r => r.status === 'rejected').length },
      ]
    : [
        { value: null, label: 'Todas', count: filteredRequests.length },
      ];

  const handleRowSelect = (request: RequestRow) => {
    setSelectedRow(selectedRow === request ? null : request);
    onRequestSelect?.(request);
  };

  const handleStatusFilterChange = (value: string | null) => {
    setStatusFilter(value);
    onStatusFilterChange?.(value);
  };

  return (
    <div className="requests-card">
      <div className="section-header">
        <div>
          <h2 className="m-0 text-[15px] font-semibold tracking-[-0.02em] text-[#253047]">Solicitudes recientes</h2>
          {isDashboard && (
            <p className="mt-[6px] mb-0 text-[11px] text-[#8b94a5]">
              Gestiona y da seguimiento a las solicitudes de tu equipo.
            </p>
          )}
        </div>
      </div>

      {/* Toolbar: buscador + tabs en la misma fila (desktop) o apilados (mobile) */}
      <div className="mt-3 pb-3 border-b border-[#eef0f4] flex flex-wrap items-center gap-2.5">
        {/* Buscador — estilo .search-field del v0 */}
        <div className="flex items-center gap-2 h-8 px-2.5 bg-[#fafbfc] border border-[#e6e9ef] rounded-[6px] w-full sm:w-[218px]">
          <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#9ca5b4]" />
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 outline-none bg-transparent text-[10px] text-[#485269] placeholder:text-[#9ca5b4]"
          />
        </div>

        {/* Tabs de filtro por status — estilo .filter-tabs del v0 */}
        {isDashboard && (
          <div className="flex gap-[3px]">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                className={`text-[10px] px-[9px] py-2 rounded-[5px] border-0 transition-colors ${
                  statusFilter === tab.value
                    ? 'text-[#5047c8] bg-[#efeeff] font-bold'
                    : 'text-[#8992a4] bg-transparent'
                }`}
                onClick={() => handleStatusFilterChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabla de solicitudes */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-gray-200">
              <th className="text-left">
                {isDashboard ? 'Solicitud' : 'SOLICITUD'}
              </th>
              <th>{isDashboard ? 'Solicitante' : 'SOLICITANTE'}</th>
              <th>{isDashboard ? 'Fecha' : 'FECHA'}</th>
              <th>{isDashboard ? 'Estado' : 'ESTADO'}</th>
              <th>{isDashboard ? 'Importe' : 'IMPORTE'}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr
                key={request.id}
                className={`
                  ${selectedRow?.id === request.id ? 'bg-primary/5' : ''}
                  border-b border-gray-100 hover:bg-gray-50 transition-colors
                `}
                onClick={() => handleRowSelect(request)}
                role="button"
                tabIndex={0}
              >
                <td className="font-medium">
                  <Link
                    href={isDashboard ? `/requests/${request.id}` : `/requests/${request.id}`}
                    className="text-primary hover:underline"
                  >
                    {request.code} {request.title}
                  </Link>
                </td>
                <td className="text-sm">
                  {request.requesterName}
                </td>
                <td className="text-sm text-muted-foreground">
                  {request.submittedAt ? 
                    new Date(request.submittedAt).toLocaleDateString('es-ES') 
                    : '—'}
                </td>
                <td className="text-sm">
                  <span
                    className={`inline-flex items-center gap-1 px-2 rounded text-xs font-medium ${REQUEST_STATUS_STYLES[request.status]?.badge || ''}`}
                  >
                    <span className={REQUEST_STATUS_STYLES[request.status]?.dot || ''} />
                    {REQUEST_STATUS_STYLES[request.status]?.label || request.status}
                  </span>
                </td>
                <td className="text-sm text-muted-foreground">
                  {request.amount !== null && request.currencySymbol
                    ? formatCurrency(request.amount, request.currencySymbol)
                    : '—'}
                </td>
                <td className="text-right">
                  <div className="flex gap-1">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    <ArrowLeft className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estado vacío */}
      {filteredRequests.length === 0 && !statusFilter && (
        <div className="empty-state py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-lg">
            Aún no se han subido solicitudes
          </p>
          {isDashboard && (
            <Link
              href="/requests/new"
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Crear solicitud
            </Link>
          )}
        </div>
      )}

      {/* Fila seleccionada - panel lateral */}
      {selectedRow && onRequestSelect && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-sm text-gray-600 mb-3">
            Detalle de solicitud: {selectedRow.code} {selectedRow.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Solicitante: {selectedRow.requesterName}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Estado: <span className={`inline-flex items-center gap-1 px-2 rounded text-xs font-medium ${REQUEST_STATUS_STYLES[selectedRow.status]?.badge || ''}`}>
              <span className={REQUEST_STATUS_STYLES[selectedRow.status]?.dot || ''} />
              {REQUEST_STATUS_STYLES[selectedRow.status]?.label || selectedRow.status}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Tipo: {selectedRow.requestTypeName || '—'}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Importe: {selectedRow.amount !== null && selectedRow.currencySymbol
              ? formatCurrency(selectedRow.amount, selectedRow.currencySymbol)
              : '—'}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Fecha: {selectedRow.submittedAt ? 
              new Date(selectedRow.submittedAt).toLocaleDateString('es-ES') 
              : '—'}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Paso actual: {selectedRow.currentStepLabel || '—'}
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button className="text-sm text-primary hover:underline">
              Ver panel lateral completo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}