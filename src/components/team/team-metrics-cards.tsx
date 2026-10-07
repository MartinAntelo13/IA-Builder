import { Users, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import type { TeamSummaryRow } from '@/lib/transformers/team';

interface TeamMetricsCardsProps {
  summary: TeamSummaryRow;
}

interface MetricCardProps {
  icon: React.ReactNode;
  iconClass: string;
  value: string;
  label: string;
  sub?: string;
}

function MetricCard({ icon, iconClass, value, label, sub }: MetricCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg shadow-sm p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xl font-bold text-foreground">{value}</p>
        <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${iconClass}`}>
          {icon}
        </div>
      </div>
      <p className="mt-1 text-2xs text-muted">{label}</p>
      {sub && <p className="mt-0.5 text-2xs text-muted">{sub}</p>}
    </div>
  );
}

// pending_invitations cuenta perfiles en estado 'invited', no filas de la tabla invitations
export function TeamMetricsCards({ summary }: TeamMetricsCardsProps) {
  const { total_members, active_members, pending_invitations, added_last_30d, roles_count } =
    summary;

  const addedSub =
    added_last_30d > 0
      ? `+${added_last_30d} en los últimos 30 días`
      : 'Sin altas en los últimos 30 días';

  const activePct =
    total_members > 0
      ? `${((active_members / total_members) * 100).toFixed(1).replace('.', ',')}% del total`
      : undefined;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<Users size={16} />}
        iconClass="bg-primary/10 text-primary"
        value={String(total_members)}
        label="Miembros del equipo"
        sub={addedSub}
      />
      <MetricCard
        icon={<CheckCircle2 size={16} />}
        iconClass="bg-success-bg text-success"
        value={String(active_members)}
        label="Miembros activos"
        sub={activePct}
      />
      <MetricCard
        icon={<Clock3 size={16} />}
        iconClass="bg-warning-bg text-warning"
        value={String(pending_invitations)}
        label="Invitaciones pendientes"
        sub="Esperando respuesta"
      />
      <MetricCard
        icon={<ShieldCheck size={16} />}
        iconClass="bg-primary-muted/10 text-primary-muted"
        value={String(roles_count)}
        label="Roles configurados"
        sub="Definidos en la organización"
      />
    </div>
  );
}
