import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES, INBOX_PAGE_SIZE } from '@/constants';
import { transformInboxRow, transformInboxKpis } from '@/lib/transformers/inbox';
import { InboxMetricsCards } from '@/components/inbox/inbox-metrics-cards';
import { InboxTabs } from '@/components/inbox/inbox-tabs';
import { InboxFilters } from '@/components/inbox/inbox-filters';
import { InboxList } from '@/components/inbox/inbox-list';
import { Pagination } from '@/components/shared/pagination';
import { Inbox } from 'lucide-react';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(val: string | string[] | undefined): string {
  return typeof val === 'string' ? val : '';
}

export default async function InboxPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const rawTab = getString(params.tab);
  const tab = rawTab === 'reviewed' ? 'reviewed' : 'pending';

  const rawSort = getString(params.sort);
  const sort = rawSort === 'amount_desc' ? 'amount_desc' : 'newest';

  const q = getString(params.q).trim();

  const rawPage = parseInt(getString(params.page) || '1', 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const supabase = await createSupabaseServerClient();

  const [activeResult, kpisResult, reviewedCountResult] = await Promise.all([
    supabase.rpc('list_inbox', {
      p_tab: tab,
      p_sort: sort,
      p_search: q || undefined,
      p_page: page,
      p_page_size: INBOX_PAGE_SIZE,
    }),
    supabase.rpc('get_inbox_kpis'),
    supabase.rpc('list_inbox', {
      p_tab: 'reviewed',
      p_page: 1,
      p_page_size: 1,
    }),
  ]);

  if (activeResult.error) throw activeResult.error;
  if (kpisResult.error) throw kpisResult.error;
  if (reviewedCountResult.error) throw reviewedCountResult.error;

  const rows = (activeResult.data ?? []).map(transformInboxRow);
  // totalCount viene de count(*) over () por fila. Si la página pedida está fuera
  // de rango la RPC devuelve 0 filas, así que totalCount no sirve para detectarlo.
  const totalCount = rows[0]?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / INBOX_PAGE_SIZE));

  if (rows.length === 0 && page > 1) {
    const safeParams = new URLSearchParams();
    safeParams.set('tab', tab);
    if (sort !== 'newest') safeParams.set('sort', sort);
    if (q) safeParams.set('q', q);
    safeParams.set('page', String(page - 1));
    redirect(`${ROUTES.INBOX}?${safeParams.toString()}`);
  }

  const kpisRow = kpisResult.data?.[0];
  const kpis = kpisRow ? transformInboxKpis(kpisRow) : null;

  const pendingCount = kpis?.pendingCount ?? 0;
  const reviewedCount = reviewedCountResult.data?.[0]?.total_count ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 max-md:px-3 max-md:py-4">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-primary/10 grid place-items-center shrink-0">
            <Inbox size={18} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Bandeja de entrada</h1>
        </div>
        <p className="ml-12 text-2xs text-muted">
          Revisa y gestiona las solicitudes que requieren tu aprobación.
        </p>
      </header>

      {kpis && <InboxMetricsCards kpis={kpis} />}

      <div className="bg-white border border-border rounded-lg shadow-sm mt-6">
        <InboxTabs
          tab={tab}
          sort={sort}
          q={q}
          pendingCount={pendingCount}
          reviewedCount={reviewedCount}
        />

        <div className="px-4 pt-4 pb-2">
          <InboxFilters tab={tab} sort={sort} q={q} />
        </div>

        <InboxList rows={rows} tab={tab} />

        <div className="px-4 py-3 border-t border-border">
          <Pagination
            basePath={ROUTES.INBOX}
            params={{
              tab,
              ...(sort !== 'newest' ? { sort } : {}),
              ...(q ? { q } : {}),
            }}
            page={page}
            totalCount={totalCount}
            totalPages={totalPages}
            pageSize={INBOX_PAGE_SIZE}
            itemLabel="solicitudes"
          />
        </div>
      </div>
    </div>
  );
}
