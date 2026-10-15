// Regla 3: 'use client' — usePathname para el breadcrumb y useCurrentUser (iniciales).
'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { TopbarSearch } from '@/components/dashboard/topbar-search';
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown';
import { ROUTES } from '@/constants';

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
  if (pathname === '/requests/new') return 'Nueva solicitud';
  if (pathname.startsWith('/requests/') && pathname.endsWith('/edit')) return 'Editar solicitud';
  if (pathname.startsWith('/requests/')) return 'Detalle de solicitud';
  if (pathname.startsWith('/inbox')) return 'Bandeja de entrada';
  if (pathname.startsWith('/workflows')) return 'Workflows';
  if (pathname.startsWith('/team')) return 'Equipo';
  if (pathname.startsWith('/settings')) return 'Configuración';
  return 'Resumen';
}

/**
 * Topbar compartido del dashboard (Client Component: usa usePathname y el hook de usuario).
 * Contiene SOLO: breadcrumb, búsqueda, notificaciones y avatar con iniciales.
 * El saludo y "Personalizar vista" viven en el encabezado de app/(dashboard)/page.tsx.
 * El contador de notificaciones viaja como prop desde el layout (ver (dashboard)/layout.tsx):
 * el servidor lo precarga desde get_dashboard_kpis y se refresca con cada revalidatePath.
 */
interface TopbarProps {
  awaitingMyReview: number;
}

export function Topbar({ awaitingMyReview }: TopbarProps) {
  const pathname = usePathname();
  const { profile } = useCurrentUser();

  const initials = getInitials(profile?.fullName ?? null, profile?.email ?? null);
  const breadcrumbTitle = getBreadcrumbTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-17 shrink-0 items-center justify-between gap-4 border-b border-[#eceef3] bg-white px-4 md:px-10">
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
        {pathname !== ROUTES.REQUESTS && <TopbarSearch />}

        <NotificationsDropdown awaitingMyReview={awaitingMyReview} />

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
