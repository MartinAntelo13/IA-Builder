import { FileText, MessageSquare, Paperclip, Download } from 'lucide-react';
import type { RequestDetailData } from '@/types/request-detail';
import { formatPriority, formatBytes, formatRelativeTime } from '@/lib/format-helpers';
import { RequestCommentForm } from '@/components/requests/request-comment-form';

interface RequestInfoProps {
  detail: RequestDetailData;
  userInitials: string;
}

const FILE_BADGE: Record<string, string> = {
  pdf: 'text-danger bg-danger-bg',
  img: 'text-success bg-success-bg',
  xls: 'text-success bg-success-bg',
  doc: 'text-primary bg-background',
  file: 'text-muted bg-border',
};

function getFileBadge(mimeType: string): { cls: string; label: string } {
  if (mimeType.includes('pdf')) return { cls: 'pdf', label: 'PDF' };
  if (mimeType.includes('image')) return { cls: 'img', label: 'IMG' };
  if (mimeType.includes('spreadsheet')) return { cls: 'xls', label: 'XLS' };
  if (mimeType.includes('word')) return { cls: 'doc', label: 'DOC' };
  return { cls: 'file', label: 'FILE' };
}

const CARD = 'bg-white border border-border rounded-lg shadow-sm p-6 max-md:p-4';
const CARD_TITLE = 'flex items-center gap-2 pb-4 mb-4 border-b border-border text-primary';

export function RequestInfo({ detail, userInitials }: RequestInfoProps) {
  const hasAmount = detail.request.amount && parseFloat(detail.request.amount) > 0;

  return (
    <>
      <article className={CARD}>
        <div className={CARD_TITLE}>
          <FileText size={16} />
          <h2 className="m-0 text-foreground text-sm tracking-tight">Información de la solicitud</h2>
        </div>
        <div className="grid grid-cols-2 gap-y-5 gap-x-12 max-md:grid-cols-1 max-md:gap-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-2xs text-muted">Solicitante</span>
            <strong className="flex items-center text-foreground text-xs">{detail.requester.full_name}</strong>
            {detail.requester.job_title && (
              <small className="text-2xs text-muted">
                {detail.requester.department_name && `${detail.requester.department_name} · `}
                {detail.requester.job_title}
              </small>
            )}
          </div>
          {detail.requester.department_name && (
            <div className="flex flex-col gap-1">
              <span className="text-2xs text-muted">Departamento</span>
              <strong className="flex items-center text-foreground text-xs">{detail.requester.department_name}</strong>
              {detail.requester.department_code && <small className="text-2xs text-muted">{detail.requester.department_code}</small>}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-2xs text-muted">Tipo de solicitud</span>
            <strong className="flex items-center text-foreground text-xs">{detail.request_type.name}</strong>
            {detail.request_type.description && <small className="text-2xs text-muted">{detail.request_type.description}</small>}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xs text-muted">Prioridad</span>
            <strong className="flex items-center text-foreground text-xs">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-1 shrink-0" />
              {formatPriority(detail.request.priority)}
            </strong>
            <small className="text-2xs text-muted">
              {detail.request.priority === 'high'
                ? 'Requiere atención prioritaria'
                : detail.request.priority === 'low'
                  ? 'Baja urgencia'
                  : 'Prioridad normal'}
            </small>
          </div>
          {detail.cost_center && (
            <div className="flex flex-col gap-1">
              <span className="text-2xs text-muted">Centro de costo</span>
              <strong className="flex items-center text-foreground text-xs">{detail.cost_center.name}</strong>
              <small className="text-2xs text-muted">{detail.cost_center.code}</small>
            </div>
          )}
        </div>
      </article>

      <article className={CARD}>
        <div className={CARD_TITLE}>
          <MessageSquare size={16} />
          <h2 className="m-0 text-foreground text-sm tracking-tight">Descripción</h2>
        </div>
        <p className="m-0 mb-1 text-muted text-2xs leading-relaxed whitespace-pre-wrap">
          {detail.request.description || '(Sin descripción)'}
        </p>
        {hasAmount && (
          <div className="flex flex-wrap gap-3 items-center justify-between mt-4 p-3 bg-background border border-border rounded-md">
            <span className="text-muted text-2xs">Monto estimado</span>
            <strong className="text-primary text-base">
              {detail.currency.symbol}
              {parseFloat(detail.request.amount!).toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: 'always',
              })}{' '}
              <small className="text-primary-muted text-2xs font-medium ml-1">{detail.currency.code}</small>
            </strong>
          </div>
        )}
      </article>

      {detail.attachments.length > 0 && (
        <article className={CARD}>
          <div className={CARD_TITLE}>
            <Paperclip size={16} />
            <h2 className="m-0 text-foreground text-sm tracking-tight">
              Archivos adjuntos{' '}
              <small className="text-muted text-2xs font-medium">({detail.attachments.length})</small>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-4 max-md:grid-cols-1">
            {detail.attachments.map((att) => {
              const { cls, label } = getFileBadge(att.mime_type);
              return (
                <div key={att.id} className="flex items-center gap-2 min-w-0 p-2.5 text-muted bg-surface border border-border rounded-md">
                  <div className={`w-7 h-8 grid place-items-center rounded text-2xs font-extrabold shrink-0 ${FILE_BADGE[cls]}`}>
                    {label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="block overflow-hidden text-foreground text-2xs font-bold truncate">{att.file_name}</strong>
                    <small className="block mt-1 text-muted text-2xs">{formatBytes(att.size_bytes)}</small>
                  </div>
                  <a
                    href={`/requests/${detail.request.id}/attachments/${att.id}`}
                    aria-label={`Descargar ${att.file_name}`}
                    className="ml-auto text-muted hover:text-primary shrink-0"
                  >
                    <Download size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        </article>
      )}

      <article className={CARD}>
        <div className={CARD_TITLE}>
          <MessageSquare size={16} />
          <h2 className="m-0 text-foreground text-sm tracking-tight">Comentarios</h2>
        </div>
        {detail.comments.length > 0 ? (
          <div className="flex flex-col">
            {detail.comments.map((comment) => (
              <div key={comment.id} className="py-3.5 border-b border-border first:pt-0 last:pb-0 last:border-b-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <strong className="text-foreground text-2xs font-bold">
                    {comment.author_name}
                    {comment.author_roles.length > 0 && (
                      <span className="text-muted font-medium"> · {comment.author_roles.join(', ')}</span>
                    )}
                  </strong>
                  <small className="text-muted text-2xs whitespace-nowrap">{formatRelativeTime(comment.created_at)}</small>
                </div>
                <p className="m-0 text-muted text-2xs leading-relaxed whitespace-pre-wrap">{comment.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-muted text-2xs text-center py-5">Todavía no hay comentarios.</p>
        )}
        <RequestCommentForm requestId={detail.request.id} userInitials={userInitials} />
      </article>
    </>
  );
}
