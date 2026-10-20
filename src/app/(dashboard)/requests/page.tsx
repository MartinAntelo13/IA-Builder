import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getCurrentProfile } from "@/lib/supabase/server";
import { FileText, Plus } from "lucide-react";
import { RequestsSection } from "@/components/requests/requests-section";
import { Greeting } from "@/components/dashboard/greeting";
import { Pagination } from "@/components/shared/pagination";
import { ROUTES, REQUESTS_PAGE_SIZE } from "@/constants";
import { transformRequestRows } from "@/lib/transformers/requests";

export const metadata: Metadata = {
  title: "Mis solicitudes - Flowdesk",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(val: string | string[] | undefined): string {
  return typeof val === "string" ? val : "";
}

export default async function RequestsPage({ searchParams }: PageProps) {
  const profile = await getCurrentProfile();
  if (!profile) return redirect(ROUTES.LOGIN);

  const params = await searchParams;

  const q = getString(params.q).trim();
  const rawPage = parseInt(getString(params.page) || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const supabase = await createSupabaseServerClient();

  // p_search se omite cuando q está vacío (la RPC no acepta null; la clave ausente lo deja sin filtro).
  const { data: requestsData, error: requestsError } = await supabase.rpc("list_requests", {
    p_scope: "mine",
    p_page: page,
    p_page_size: REQUESTS_PAGE_SIZE,
    ...(q ? { p_search: q } : {}),
  });

  if (requestsError) {
    throw new Error(requestsError.message);
  }

  const rows = transformRequestRows(requestsData ?? []);
  const totalCount = Number(requestsData?.[0]?.total_count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / REQUESTS_PAGE_SIZE));

  // Fuera de rango: la RPC devuelve 0 filas, redirigimos preservando q.
  if (rows.length === 0 && page > 1) {
    const safe = new URLSearchParams();
    if (q) safe.set("q", q);
    const qs = safe.toString();
    redirect(qs ? `${ROUTES.REQUESTS}?${qs}` : ROUTES.REQUESTS);
  }

  const showEmptyNoRequests = totalCount === 0 && !q;

  return (
    <div className="page-wrap">
      <section className="hero">
        <div>
          <p className="eyebrow">MI ESPACIO DE TRABAJO</p>
          <Greeting
            fullName={profile.fullName ?? null}
            format="first"
            email={profile.email ?? null}
          />
          <p className="hero-subtitle">
            Todas tus solicitudes enviadas y su estado actual.
          </p>
        </div>
        <div className="hero-actions">
          <Link href={ROUTES.REQUESTS_NEW} className="hero-button hero-button--primary">
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Link>
        </div>
      </section>

      {showEmptyNoRequests ? (
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
      ) : (
        <>
          <RequestsSection requests={rows} q={q} />
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                basePath={ROUTES.REQUESTS}
                params={q ? { q } : {}}
                page={page}
                totalCount={totalCount}
                totalPages={totalPages}
                pageSize={REQUESTS_PAGE_SIZE}
                itemLabel="solicitudes"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
