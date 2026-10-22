import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseServerClient, getCurrentProfile } from '@/lib/supabase/server';
import { ROUTES, REQUEST_STATUS_STYLES } from '@/constants';
import { getRequestDetail } from '@/lib/requests/get-request-detail';
import { RequestInfo } from '@/components/requests/request-info';
import { RequestWorkflowCard, RequestActivityCard } from '@/components/requests/request-history';
import { RequestActionsPanel } from '@/components/requests/request-actions-panel';
import { findChangesComment, findDecisionComment } from '@/lib/transformers/requests';
import { RequestCancelMenu } from '@/components/requests/request-cancel-menu';
import { DuplicateRequestButton } from '@/components/requests/duplicate-request-button';
import { getInitials } from '@/lib/initials';

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);

  const profile = await getCurrentProfile();
  if (!profile?.organization) return notFound();

  const supabase = await createSupabaseServerClient();
  const detail = await getRequestDetail(supabase, id);
  if (!detail) return notFound();
  const statusStyle = REQUEST_STATUS_STYLES[detail.request.status];
  const changesComment = findChangesComment(detail.approvals);
  const rejectionComment = findDecisionComment(detail.approvals, 'rejected');
  const submitError = detail.request.status === 'draft' && typeof sp.submit_error === 'string'
    ? sp.submit_error
    : null;
  // Allowlist estricta: solo el valor exacto 'inbox' activa el flujo "vine de
  // la bandeja". Cualquier otro valor se ignora.
  const fromInbox = typeof sp.from === 'string' && sp.from === 'inbox';
  const userInitials = getInitials(profile.fullName, profile.email);

  return (
    <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12">
      <div className="flex items-center gap-2 mb-5 text-2xs text-muted">
        <Link
          href={fromInbox ? ROUTES.INBOX : ROUTES.REQUESTS}
          className="text-primary font-bold no-underline"
        >
          {fromInbox ? 'Bandeja de entrada' : 'Solicitudes'}
        </Link>
        <span>/</span>
        <strong className="text-muted font-semibold">{detail.request.code}</strong>
      </div>

      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap max-md:items-start">
            <Link href={ROUTES.REQUESTS} className="grid place-items-center text-muted hover:text-primary" aria-label="Volver">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="m-0 text-foreground text-2xl tracking-tight max-md:text-xl">{detail.request.title}</h1>
            {statusStyle && (
              <span className={`inline-flex items-center px-2 py-1 rounded text-2xs font-bold whitespace-nowrap ${statusStyle.badge}`}>
                {statusStyle.label}
              </span>
            )}
          </div>
          <p className="mt-1.5 ml-7 text-2xs text-muted">
            {detail.request.code} · Creada el{' '}
            {new Date(detail.request.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            por {detail.requester.full_name}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {profile.id === detail.requester.id && (
            <DuplicateRequestButton requestId={detail.request.id} />
          )}
          {detail.viewer.can_edit && (
            <Link
              href={`${ROUTES.REQUESTS}/${detail.request.id}/edit`}
              className="grid place-items-center w-8 h-8 rounded-md text-muted hover:bg-border cursor-pointer"
              aria-label="Editar solicitud"
            >
              <Pencil size={16} />
            </Link>
          )}
          {detail.viewer.can_cancel && (
            <RequestCancelMenu requestId={detail.request.id} />
          )}
        </div>
      </div>

      <section className="flex flex-col lg:flex-row gap-5 items-start w-full">
        <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-4">
          <RequestInfo detail={detail} userInitials={userInitials} />
        </div>
        <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
          <RequestWorkflowCard detail={detail} />
          {submitError && (
            <div role="alert" className="p-3 bg-danger-bg border border-border rounded-lg text-2xs">
              <p className="m-0 text-danger">{submitError}</p>
              <p className="m-0 mt-1 text-muted">El borrador quedó guardado. Podés volver a enviarlo desde acá.</p>
            </div>
          )}
          {(detail.viewer.can_decide || detail.viewer.can_resubmit || detail.viewer.can_submit || !!rejectionComment) && (
            <RequestActionsPanel
              requestId={detail.request.id}
              canDecide={detail.viewer.can_decide}
              canResubmit={detail.viewer.can_resubmit}
              canSubmit={detail.viewer.can_submit}
              changesComment={changesComment}
              rejectionComment={rejectionComment}
              returnToInbox={fromInbox}
            />
          )}
          <RequestActivityCard detail={detail} />
        </aside>
      </section>
    </div>
  );
}
