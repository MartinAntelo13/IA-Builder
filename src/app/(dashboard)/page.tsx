import { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient, getCurrentProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Plus, SlidersHorizontal } from "lucide-react";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { RequestsTable } from "@/components/dashboard/requests-table";
import { Greeting } from '@/components/dashboard/greeting';
import type { Database } from "@/types/database.types";
import { transformRequestRows } from "@/lib/transformers/requests";

export const metadata: Metadata = {
  title: "Dashboard - Flowdesk",
};

export default async function DashboardPage() {
  // Verificar sesión y obtener perfil
  const profile = await getCurrentProfile();
   
  if (!profile) {
    return redirect("/login");
  }

  const supabase = await createSupabaseServerClient();

  // Obtener KPIs del dashboard
  const { data: kpisData, error: kpisError } = await supabase
    .rpc('get_dashboard_kpis')
    .single<Database['public']['Functions']['get_dashboard_kpis']['Returns']>();

  if (kpisError) {
    console.error('Error fetching dashboard KPIs:', kpisError);
  }

  // Obtener solicitudes recientes (scope='visible', page_size=4)
  const { data: requestsData, error: requestsError, count } = await supabase
    .rpc('list_requests', {
      p_scope: 'visible',
      p_page_size: 4
    });

  if (requestsError) {
    console.error('[DashboardPage] Error fetching recent requests:', requestsError);
  }
  
  console.log('[DashboardPage] requestsData type:', typeof requestsData, 'is array:', Array.isArray(requestsData), 'length:', requestsData?.length);
  if (requestsData && requestsData.length > 0) {
    console.log('[DashboardPage] First request:', JSON.stringify(requestsData[0], null, 2));
  }

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
          <button type="button" className="hero-button" aria-label="Personalizar vista">
            <SlidersHorizontal className="h-4 w-4" />
            Personalizar vista
          </button>
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
            <p className="text-muted-foreground">Cargando métricas...</p>
          </div>
        )}
      </section>

      <section>
        {requestsData && requestsData.length > 0 ? (
          <>
            {/* RequestsTable ya renderiza su propia tarjeta y encabezado */}
            <RequestsTable
              requests={transformRequestRows(requestsData)}
              totalCount={count ?? 0}
              isDashboard={true}
            />
            <div className="mt-3 text-right">
              <Link
                href="/requests"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver todas
              </Link>
            </div>
          </>
        ) : (
          <div className="requests-card">
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                Aún no se han subido solicitudes
              </p>
              <Link
                href="/requests/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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