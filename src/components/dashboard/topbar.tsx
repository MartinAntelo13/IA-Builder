// 'use client' - requires usePathname, useEffect, useState, and useCurrentUser hook
// for breadcrumb navigation, notifications badge, and user profile display
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { supabase } from '@/lib/supabase/client';

/**
 * Iniciales del usuario (ej. "Martín Antelo" -> "MA").
 * Misma lógica que el avatar del footer de sidebar.tsx.
 */
function getInitials(fullName: string | null, email: string | null): string {
  const source = fullName?.trim() || email?.split('@')[0] || '';
  if (!source) return 'U';
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getBreadcrumbTitle(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'Resumen';
  if (pathname === '/requests') return 'Mis solicitudes';
  if (pathname.startsWith('/requests/')) return 'Detalle de solicitud';
  if (pathname.startsWith('/inbox')) return 'Bandeja de entrada';
  return 'Resumen';
}

/**
 * Topbar compartido del dashboard (Client Component: usa usePathname y el hook de usuario).
 * Contiene SOLO: breadcrumb, búsqueda, notificaciones y avatar con iniciales.
 * El saludo y "Personalizar vista" viven en el encabezado de app/(dashboard)/page.tsx.
 */
export function Topbar() {
  const pathname = usePathname();
  const { profile } = useCurrentUser();
  const isDashboardRoot = pathname === '/' || pathname === '';
  const [awaitingMyReview, setAwaitingMyReview] = useState(0);

  // El badge de notificaciones refleja awaiting_my_review de get_dashboard_kpis
  useEffect(() => {
    const fetchAwaitingMyReview = async () => {
      const { data, error } = await supabase
        .rpc('get_dashboard_kpis')
        .single<{ awaiting_my_review: number }>();

      if (!error && data) {
        setAwaitingMyReview(data.awaiting_my_review);
      }
    };

    void fetchAwaitingMyReview();
  }, [pathname]);

  const initials = getInitials(profile?.fullName ?? null, profile?.email ?? null);
  const breadcrumbTitle = getBreadcrumbTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-[#eceef3] bg-white px-4 md:px-10">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="flex min-w-0 items-center gap-2 text-xs text-[#a0a8b8]"
      >
        <Link href="/" className="hidden shrink-0 hover:text-primary sm:inline">
          Workspace
        </Link>
        <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden="true" />
        <strong className="truncate font-semibold text-[#465066]">{breadcrumbTitle}</strong>
      </nav>

      {/* Acciones fijas: búsqueda, notificaciones, avatar */}
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          aria-label="Buscar"
          className="text-[#9da5b4] transition-colors hover:text-[#465066]"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative text-[#9da5b4] transition-colors hover:text-[#465066]"
        >
          <Bell className="h-[18px] w-[18px]" />
          {isDashboardRoot && awaitingMyReview > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {awaitingMyReview}
            </span>
          )}
        </button>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
          title={profile?.fullName ?? profile?.email ?? undefined}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
