import type { InboxKpis } from '@/lib/transformers/inbox';

interface InboxMetricsCardsProps {
  kpis: InboxKpis;
}

interface MetricCardProps {
  value: string;
  label: string;
}

function MetricCard({ value, label }: MetricCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg shadow-sm p-5">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-2xs text-muted">{label}</p>
    </div>
  );
}

export function InboxMetricsCards({ kpis }: InboxMetricsCardsProps) {
  const pending = kpis.pendingCount != null ? String(kpis.pendingCount) : '—';
  const highPriority = kpis.highPriorityCount != null ? String(kpis.highPriorityCount) : '—';
  const avgDays =
    kpis.avgResponseDays != null
      ? `${Number(kpis.avgResponseDays).toFixed(1)} días`
      : '—';
  const sla =
    kpis.slaCompliancePct != null
      ? `${Math.round(Number(kpis.slaCompliancePct))}%`
      : '—';

  return (
    <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
      <MetricCard value={pending} label="Pendientes de revisión" />
      <MetricCard value={highPriority} label="Alta prioridad" />
      <MetricCard value={avgDays} label="Tiempo medio de respuesta" />
      <MetricCard value={sla} label="Dentro del SLA" />
    </div>
  );
}
