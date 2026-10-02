'use client';

// Client: la card 'Esperando mi revisión' es clickeable y navega a /inbox, necesita onClick/onKeyDown
import { TrendingUp, TrendingDown, AlertTriangle, FileCheck2, Send, Clock3, CheckCircle2 } from 'lucide-react';

interface MetricsCardsProps {
  activeRequests: number;
  submittedLast30d: number;
  activeDeltaPct: number | null;
  awaitingMyReview: number;
  avgApprovalDays: number | null;
  avgApprovalDaysDelta: number | null;
  approvalRatePct: number | null;
  approvalRateDeltaPts: number | null;
}

/**
 * Componente Server que renderiza las 5 tarjetas de KPIs del dashboard.
 * Recibe todos los datos por props, no hace fetch propio.
 */
export function MetricsCards({
  activeRequests,
  submittedLast30d,
  activeDeltaPct,
  awaitingMyReview,
  avgApprovalDays,
  avgApprovalDaysDelta,
  approvalRatePct,
  approvalRateDeltaPts,
}: MetricsCardsProps) {
  const formatNumber = (num: number) => new Intl.NumberFormat('es-ES').format(num);

  const renderDelta = (
    value: number | null,
    label: string,
    inverted: boolean = false
  ) => {
    if (value === null || value === undefined) {
      return null;
    }

    const isPositive = inverted ? value < 0 : value > 0;
    const isNegative = inverted ? value > 0 : value < 0;
    const absValue = Math.abs(value);

    return (
      <p className="mt-2 text-xs">
        <span
          className={`font-medium flex items-center gap-1 ${
            isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-muted-foreground'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : isNegative ? (
            <TrendingDown className="h-3 w-3" />
          ) : null}
          {absValue}{label}
        </span>
        <span className="text-muted-foreground ml-1">vs. 30 días anteriores</span>
      </p>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Solicitudes activas */}
      <div className="metric-card bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Solicitudes activas</span>
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <FileCheck2 className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-gray-900">
          {formatNumber(activeRequests)}
        </div>
      </div>

      {/* 2. Enviadas (30 días) */}
      <div className="metric-card bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Enviadas (30 días)</span>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Send className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-gray-900">
          {formatNumber(submittedLast30d)}
        </div>
        {renderDelta(activeDeltaPct, '%')}
      </div>

      {/* 3. Esperando mi revisión */}
      <div className="metric-card bg-white border border-gray-200 rounded-lg p-5 shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => window.location.href = '/inbox'}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.location.href = '/inbox'; }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Esperando mi revisión</span>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            awaitingMyReview > 0 ? 'bg-amber-100' : 'bg-gray-100'
          }`}>
            <Clock3 className={`h-5 w-5 ${awaitingMyReview > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-gray-900">
          {formatNumber(awaitingMyReview)}
        </div>
        {awaitingMyReview > 0 && (
          <p className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Requieren atención
          </p>
        )}
      </div>

      {/* 4. Tiempo promedio de aprobación */}
      <div className="metric-card bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Tiempo promedio de aprobación</span>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Clock3 className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-gray-900">
          {avgApprovalDays !== null ? `${avgApprovalDays.toFixed(1)}` : '—'}
          <span className="text-lg font-normal text-gray-500 ml-1">días</span>
        </div>
        {renderDelta(avgApprovalDaysDelta, ' días', true)}
      </div>

      {/* 5. Tasa de aprobación */}
      <div className="metric-card bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Tasa de aprobación</span>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-gray-900">
          {approvalRatePct !== null ? `${approvalRatePct}%` : '—'}
        </div>
        {renderDelta(approvalRateDeltaPts, ' pts')}
      </div>
    </div>
  );
}