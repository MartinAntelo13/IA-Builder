// 'use client' is not needed here - this is a Server Component
// that receives user data via props from the layout
import Link from 'next/link';
import { LayoutDashboard, FileText, Inbox, Workflow, Users, Settings, Plus, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { NAV_ITEMS, MANAGEMENT_NAV_ITEMS, ROUTES } from '@/constants';
// Regla 7: el shape combinado (profiles + roles + organizations) no es una tabla
// ni una RPC — es el tipo que arma y exporta getCurrentProfile() en server.ts a
// partir de los tipos reales de cada tabla. Se importa desde ahí en vez de
// redefinirlo a mano aquí.
import type { CurrentProfile } from '@/lib/supabase/server';

interface SidebarProps {
  user: CurrentProfile;
  canManageWorkflows?: boolean;
  activeItem?: string;
  className?: string;
}

/**
 * Sidebar del dashboard - Server Component que recibe el usuario por props.
 * No hace fetch propio, los datos vienen del layout.
 * Soporta colapso responsive: w-[68px] en mobile (solo íconos), w-64 en desktop (íconos + texto).
 */
export function Sidebar({ user, canManageWorkflows = false, activeItem = 'Resumen', className }: SidebarProps) {
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden ${className ?? ''}`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg text-gray-900 hidden md:inline">Flowdesk</span>
      </div>

      {/* New Request Button */}
      <Link
        href={ROUTES.REQUESTS_NEW}
        className="mx-4 mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline">Nueva solicitud</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3" aria-label="Navegación principal">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 hidden md:block">
          Espacio de trabajo
        </p>
        <ul className="space-y-1">
           {NAV_ITEMS.map((item) => {
             const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
               'LayoutDashboard': LayoutDashboard,
               'FileText': FileText,
               'Inbox': Inbox,
             };
             const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;

             return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeItem === item.label
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2 hidden md:block">
          Gestión
        </p>
        <ul className="space-y-1">
          {MANAGEMENT_NAV_ITEMS.filter((item) => item.href !== ROUTES.WORKFLOWS || canManageWorkflows).map((item) => {
            const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
              'Workflow': Workflow,
              'Users': Users,
              'Settings': Settings,
            };
            const Icon = ICON_MAP[item.icon] ?? Workflow;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeItem === item.label
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 hidden md:block">
            <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
            <p className="text-xs text-gray-500 truncate">
              {user.jobTitle || user.roles[0]?.name || 'Sin cargo'}
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 shrink-0">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}