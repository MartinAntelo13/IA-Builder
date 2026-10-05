import { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient, getCurrentProfile } from "@/lib/supabase/server";
import { FileText, Plus, SlidersHorizontal } from "lucide-react";
import { redirect } from "next/navigation";
import { RequestsTable } from "@/components/dashboard/requests-table";
import type { Database } from "@/types/database.types";
import { Greeting } from '@/components/dashboard/greeting';
import { transformRequestRows } from "@/lib/transformers/requests";

export const metadata: Metadata = {
  title: "Mis solicitudes - Flowdesk",
};

export default async function RequestsPage() {
  // Verificar sesión y obtener perfil
  const profile = await getCurrentProfile();
  
  if (!profile) {
    return redirect("/login");
  }

  const supabase = await createSupabaseServerClient();

  // Parámetros de paginación (por ahora fijos, luego se pueden hacer dinámicos)
  const page = 1;
  const pageSize = 20;

  // Obtener solicitudes del usuario (scope='mine', paginado)
  const { data: requestsData, error: requestsError, count } = await supabase
    .rpc('list_requests', {
      p_scope: 'mine',
      p_page: page,
      p_page_size: pageSize
    });

  if (requestsError) {
    console.error('[RequestsPage] Error fetching user requests:', requestsError);
  }

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
      {requestsData && requestsData.length > 0 ? (
          <RequestsTable
            requests={transformRequestRows(requestsData)}
            totalCount={count ?? 0}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Aún no se han subido solicitudes
            </p>
            <a 
              href="/requests/new" 
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Crear solicitud
            </a>
          </div>
        )}
</div>

    
        
       
    
  );
}