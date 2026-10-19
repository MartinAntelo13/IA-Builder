import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createSupabaseServerClient, getCurrentProfile } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import { requestDetailHref } from '@/lib/routes';
import { getRequestDetail } from '@/lib/requests/get-request-detail';
import { EditRequestForm } from '@/components/requests/edit-request-form';

export const metadata: Metadata = { title: 'Editar solicitud - Flowdesk' };

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile?.organization) return notFound();

  const supabase = await createSupabaseServerClient();
  const detail = await getRequestDetail(supabase, id);
  if (!detail) return notFound();
  if (!detail.viewer.can_edit) return notFound();

  const [{ data: requestTypes }, { data: costCenters }] = await Promise.all([
    supabase
      .from('request_types')
      .select('id, name, requires_amount')
      .eq('organization_id', profile.organizationId)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('cost_centers')
      .select('id, name, code')
      .eq('organization_id', profile.organizationId)
      .eq('is_active', true)
      .order('name'),
  ]);

  const currencySymbol = profile.organization?.currency_symbol ?? '$';

  return (
    <div className="request-page-wrap">
      <div className="request-breadcrumb">
        <Link href={ROUTES.REQUESTS}>Mis solicitudes</Link>
        <ChevronRight size={14} />
        <Link href={requestDetailHref(id)}>{detail.request.code}</Link>
        <ChevronRight size={14} />
        <span>Editar</span>
      </div>

      <EditRequestForm
        detail={detail}
        requestTypes={requestTypes ?? []}
        costCenters={costCenters ?? []}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
