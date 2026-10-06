import type { Database } from '@/types/database.types';

type RequestStatus = Database['public']['Enums']['request_status'];
type StepStatus = Database['public']['Enums']['step_status'];
type DecisionType = Database['public']['Enums']['decision_type'];
type RequestEventType = Database['public']['Enums']['event_type'];

export function formatRequestStatus(status: RequestStatus): {
  label: string;
  variant: 'draft' | 'submitted' | 'in_review' | 'changes_requested' | 'approved' | 'rejected' | 'cancelled';
} {
  const statusMap: Record<RequestStatus, { label: string; variant: RequestStatus }> = {
    draft: { label: 'Borrador', variant: 'draft' },
    submitted: { label: 'Enviada', variant: 'submitted' },
    in_review: { label: 'En revisión', variant: 'in_review' },
    changes_requested: { label: 'Cambios solicitados', variant: 'changes_requested' },
    approved: { label: 'Aprobada', variant: 'approved' },
    rejected: { label: 'Rechazada', variant: 'rejected' },
    cancelled: { label: 'Cancelada', variant: 'cancelled' },
  };
  return statusMap[status];
}

export function formatStepStatus(status: StepStatus): string {
  const statusMap: Record<StepStatus, string> = {
    pending: 'Pendiente',
    active: 'Activo',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    changes_requested: 'Cambios solicitados',
    skipped: 'Omitido',
  };
  return statusMap[status];
}

export function formatDecision(decision: DecisionType): string {
  const decisionMap: Record<DecisionType, string> = {
    approved: 'Aprobado',
    rejected: 'Rechazado',
    changes_requested: 'Cambios solicitados',
  };
  return decisionMap[decision];
}

export function formatEventType(eventType: RequestEventType): string {
  const eventMap: Record<RequestEventType, string> = {
    created: 'Solicitud creada',
    submitted: 'Solicitud enviada',
    step_assigned: 'Paso asignado',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    changes_requested: 'Cambios solicitados',
    resubmitted: 'Reenviada',
    cancelled: 'Cancelada',
    commented: 'Comentario agregado',
    attachment_added: 'Archivo agregado',
  };
  return eventMap[eventType];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '—';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSecs < 60) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  if (diffWeeks < 4) return `Hace ${diffWeeks} semana${diffWeeks > 1 ? 's' : ''}`;

  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatCurrency(amount: number, symbol: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${symbol} ${formatted}`;
}

export function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    low: 'Baja',
    normal: 'Normal',
    high: 'Alta',
  };
  return priorityMap[priority] || priority;
}
