import { CheckCircle2, Clock, XCircle, AlertCircle, SkipBack, Activity } from 'lucide-react';
import type { RequestDetailData } from '@/types/request-detail';
import { formatStepStatus, formatEventType, formatRelativeTime, formatDate } from '@/lib/format-helpers';

interface RequestHistoryProps {
  detail: RequestDetailData;
}

const TIMELINE_ICON_STYLES: Record<string, string> = {
  approved: 'text-success bg-success-bg',
  rejected: 'text-danger bg-danger-bg',
  changes_requested: 'text-warning bg-warning-bg',
  active: 'text-primary bg-background',
  skipped: 'text-muted bg-border',
  pending: 'text-muted bg-border',
};

function getStepIcon(status: string) {
  switch (status) {
    case 'approved': return <CheckCircle2 size={16} />;
    case 'rejected': return <XCircle size={16} />;
    case 'changes_requested': return <AlertCircle size={16} />;
    case 'skipped': return <SkipBack size={16} />;
    default: return <Clock size={16} />;
  }
}

const CARD = 'bg-white border border-border rounded-lg shadow-sm px-6 py-5 max-md:px-4 max-md:py-4';
const SIDE_TITLE = 'flex items-center justify-between gap-2 pb-4 mb-4 border-b border-border';
const ICON_BASE = 'relative z-10 w-6 h-6 grid place-items-center rounded-full shrink-0';

export function RequestWorkflowCard({ detail }: RequestHistoryProps) {
  return (
    <article className={CARD}>
      <div className={SIDE_TITLE}>
        <h2 className="m-0 text-foreground text-sm tracking-tight">Flujo de aprobación</h2>
      </div>
      <div className="flex flex-col">
        <div className="relative flex gap-2.5 min-h-14">
          <div className={`${ICON_BASE} ${TIMELINE_ICON_STYLES[detail.request.submitted_at ? 'approved' : 'pending']}`}>
            <CheckCircle2 size={16} />
          </div>
          <div className="flex flex-col gap-1 pt-0.5">
            <strong className="text-foreground text-2xs font-semibold">Solicitud enviada</strong>
            <span className="text-muted text-2xs">por {detail.requester.full_name}</span>
            <small className="text-muted text-2xs">
              {detail.request.submitted_at ? formatDate(detail.request.submitted_at) : '(Pendiente de envío)'}
            </small>
          </div>
          {detail.steps.length > 0 && <div className="absolute top-6 left-3 w-px h-8 bg-border" />}
        </div>

        {detail.steps.map((step, idx) => (
          <div key={step.id} className="relative flex gap-2.5 min-h-14">
            <div className={`${ICON_BASE} ${TIMELINE_ICON_STYLES[step.status] ?? 'text-muted bg-border'}`}>
              {getStepIcon(step.status)}
            </div>
            <div className="flex flex-col gap-1 pt-0.5">
              <strong className={`text-2xs font-semibold ${step.status === 'active' ? 'text-primary font-bold' : 'text-foreground'}`}>
                {step.label}
              </strong>
              <span className="text-muted text-2xs">
                {step.assigned_to_name
                  ? `Asignado a ${step.assigned_to_name}`
                  : step.role_name
                    ? `Asignado al rol ${step.role_name}`
                    : 'Pendiente de asignación'}
              </span>
              <small className="text-muted text-2xs">
                {step.decided_at
                  ? formatDate(step.decided_at)
                  : step.activated_at
                    ? `Desde ${formatDate(step.activated_at)}`
                    : formatStepStatus(step.status)}
              </small>
            </div>
            {idx < detail.steps.length - 1 && <div className="absolute top-6 left-3 w-px h-8 bg-border" />}
          </div>
        ))}
      </div>
    </article>
  );
}

export function RequestActivityCard({ detail }: RequestHistoryProps) {
  const recentEvents = detail.events.slice(-5);
  return (
    <article className={CARD}>
      <div className={SIDE_TITLE}>
        <h2 className="m-0 text-foreground text-sm tracking-tight">Actividad reciente</h2>
      </div>
      <div className="flex flex-col">
        {recentEvents.length > 0 ? (
          recentEvents.map((event) => (
            <div key={event.id} className="flex gap-2.5 py-3.5 border-b border-border first:pt-0 last:pb-0 last:border-b-0">
              <div className="w-1.5 h-1.5 mt-1 rounded-full bg-primary shrink-0" />
              <div>
                <strong className="block text-foreground text-2xs font-bold">{formatEventType(event.event_type)}</strong>
                <small className="block mt-0.5 text-muted text-2xs">
                  {event.actor_name} · {formatRelativeTime(event.created_at)}
                </small>
              </div>
            </div>
          ))
        ) : (
          <p className="flex items-center justify-center gap-1.5 m-0 py-5 text-muted text-2xs">
            <Activity size={14} />
            Sin actividad aún
          </p>
        )}
      </div>
    </article>
  );
}

export function RequestHistory({ detail }: RequestHistoryProps) {
  return (
    <>
      <RequestWorkflowCard detail={detail} />
      <RequestActivityCard detail={detail} />
    </>
  );
}
