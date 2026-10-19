// Regla 3: 'use client' — usePathname para el breadcrumb; el perfil llega por prop desde el layout.
'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { TopbarSearch } from '@/components/dashboard/topbar-search';
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown';
import { ROUTES } from '@/constants';
import type { CurrentProfile } from '@/lib/supabase/server';

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
 * Topbar compartido del dashboard (Client Component: usa usePathname).
 * Contiene SOLO: breadcrumb, búsqueda, notificaciones y avatar con iniciales.
 * El saludo y "Personalizar vista" viven en el encabezado de app/(dashboard)/page.tsx.
 * El perfil (fullName, email) y el contador de notificaciones viajan como props
 * desde el layout (ver (dashboard)/layout.tsx): el servidor los precarga vía
 * getCurrentProfile y get_dashboard_kpis, y se refrescan con cada revalidatePath.
 */
interface TopbarProps {
  awaitingMyReview: number;
  user: Pick<CurrentProfile, 'fullName' | 'email'>;
}

export function Topbar({ awaitingMyReview, user }: TopbarProps) {
  const pathname = usePathname();

  const initials = getInitials(user.fullName, user.email);
  const breadcrumbTitle = getBreadcrumbTitle(pathname);
  const accountName = user.fullName ?? user.email;
  const avatarLabel = accountName
    ? `Configuración de la cuenta de ${accountName}`
    : 'Configuración de la cuenta';

  return (
    <header className="sticky top-0 z-10 flex h-17 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-10">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="flex min-w-0 items-center gap-2 text-xs text-muted-weak"
      >
        <Link href="/" className="hidden shrink-0 hover:text-primary sm:inline">
          Workspace
        </Link>
        <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden="true" />
        <strong className="truncate font-semibold text-muted-strong">{breadcrumbTitle}</strong>
      </nav>

      {/* Acciones fijas: búsqueda, notificaciones, avatar */}
      <div className="flex shrink-0 items-center gap-4">
        {pathname !== ROUTES.REQUESTS && <TopbarSearch />}

        <NotificationsDropdown awaitingMyReview={awaitingMyReview} />

        <Link
          href={ROUTES.SETTINGS}
          aria-label={avatarLabel}
          title={accountName ?? undefined}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
