import { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient, getCurrentProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { RequestsSection } from "@/components/requests/requests-section";
import { Greeting } from '@/components/dashboard/greeting';
import { ROUTES, DASHBOARD_REQUESTS_PAGE_SIZE, DASHBOARD_STATUS_FILTERS } from "@/constants";
import { transformRequestRows } from "@/lib/transformers/requests";
import { getDashboardKpis } from "@/lib/dashboard/get-dashboard-kpis";
import { requestsListHref } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Dashboard - Flowdesk",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(val: string | string[] | undefined): string {
  return typeof val === "string" ? val : "";
}

export default async function DashboardPage({ searchParams }: PageProps) {
  // Verificar sesión y obtener perfil
  const profile = await getCurrentProfile();
   
  if (!profile) {
    return redirect("/login");
  }

  const params = await searchParams;
  const q = getString(params.q).trim();
  const rawStatus = getString(params.status);
  const status = DASHBOARD_STATUS_FILTERS.find((s) => s === rawStatus) ?? null;

  const supabase = await createSupabaseServerClient();

  // Obtener KPIs del dashboard (compartido con el layout vía cache de React).
  const { data: kpisData, error: kpisError } = await getDashboardKpis();

  if (kpisError) throw new Error(kpisError.message);

  // Solicitudes recientes (scope='visible'). p_status y p_search se omiten cuando no hay
  // filtro (la RPC no acepta null; la clave ausente lo deja sin filtro).
  const { data: requestsData, error: requestsError } = await supabase
    .rpc('list_requests', {
      p_scope: 'visible',
      p_page_size: DASHBOARD_REQUESTS_PAGE_SIZE,
      ...(status ? { p_status: [status] } : {}),
      ...(q ? { p_search: q } : {}),
    });

  if (requestsError) {
    throw new Error(requestsError.message);
  }

  const hasFilters = Boolean(status) || Boolean(q);
  const showEmptyNoRequests = !hasFilters && (requestsData?.length ?? 0) === 0;

  return (
    <div className="page-wrap">
      {/* Encabezado de Resumen: se muestra siempre, para todos los roles.
          Solo cambia la data de las secciones de abajo (resuelta por RLS). */}
      <section className="hero">
        <div>
          <p className="eyebrow">MI ESPACIO DE TRABAJO</p>
          <Greeting
            fullName={profile.fullName ?? null}
            format="first"
            email={profile.email ?? null}
          />
          <p className="hero-subtitle">
            Aquí tienes una vista general de lo que está pasando.
          </p>
        </div>
        <div className="hero-actions">
          <Link href="/requests/new" className="hero-button hero-button--primary">
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Link>
        </div>
      </section>

      <section className="metric-grid" aria-label="Métricas principales">
        {kpisData ? (
          <MetricsCards
            activeRequests={kpisData.active_requests}
            submittedLast30d={kpisData.submitted_last_30d}
            activeDeltaPct={kpisData.active_delta_pct}
            awaitingMyReview={kpisData.awaiting_my_review}
            avgApprovalDays={kpisData.avg_approval_days}
            avgApprovalDaysDelta={kpisData.avg_approval_days_delta}
            approvalRatePct={kpisData.approval_rate_pct}
            approvalRateDeltaPts={kpisData.approval_rate_delta_pts}
          />
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted">Cargando métricas...</p>
          </div>
        )}
      </section>

      <section>
        {!showEmptyNoRequests ? (
          <>
            <RequestsSection
              requests={transformRequestRows(requestsData ?? [])}
              variant="dashboard"
              status={status}
              q={q}
            />
            <div className="mt-3 text-right">
              <Link
                href={requestsListHref({ scope: 'all' })}
                className="hero-button focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Ver todas las solicitudes
              </Link>
            </div>
          </>
        ) : (
          <div className="overflow-hidden bg-card border border-border rounded-lg shadow-sm">
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <FileText className="h-12 w-12 text-muted mb-4" />
              <p className="text-center text-muted">
                Aún no se han subido solicitudes
              </p>
              <Link
                href={ROUTES.REQUESTS_NEW}
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/80"
              >
                Crear solicitud
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}