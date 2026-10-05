import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createSupabaseServerClient, getCurrentProfile } from '@/lib/supabase/server';
import { NewRequestForm } from '@/components/requests/new-request-form';
import { ROUTES } from '@/constants';

export const metadata: Metadata = { title: 'Nueva solicitud - Flowdesk' };

export default async function NewRequestPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect(ROUTES.LOGIN);

  const supabase = await createSupabaseServerClient();

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
        <span>Nueva solicitud</span>
      </div>

      <NewRequestForm
        requestTypes={requestTypes ?? []}
        costCenters={costCenters ?? []}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
