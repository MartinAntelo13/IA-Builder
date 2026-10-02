/**
 * Constantes globales de la aplicación.
 */

export const APP_NAME = 'Flowdesk';

export const APP_DESCRIPTION =
  'Gestión de solicitudes y flujos de aprobación para equipos modernos.';

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/',
  DASHBOARD: '/',
  INBOX: '/inbox',
  REQUESTS: '/requests',
  REQUESTS_NEW: '/requests/new',
  REQUEST_DETAIL: '/requests/[id]',
  WORKFLOWS: '/workflows',
  TEAM: '/team',
  SETTINGS: '/settings',
} as const;

/**
 * Estilos visuales para cada estado de solicitud.
 * Las claves deben coincidir con el enum `public.request_status`
 * del schema de base de datos.
 */
export const REQUEST_STATUS_STYLES: Record<string, {
  label: string;
  badge: string;
  dot: string;
}> = {
  draft: {
    label: 'Borrador',
    badge: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
  },
  submitted: {
    label: 'Enviada',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    dot: 'bg-blue-500',
  },
  in_review: {
    label: 'En revisión',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  changes_requested: {
    label: 'Cambios solicitados',
    badge: 'bg-orange-50 text-orange-700 ring-orange-200',
    dot: 'bg-orange-500',
  },
  approved: {
    label: 'Aprobada',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rechazada',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelada',
    badge: 'bg-slate-100 text-slate-500 ring-slate-200',
    dot: 'bg-slate-400',
  },
};

export const PRIORITY_STYLES: Record<string, {
  label: string;
  badge: string;
}> = {
  low: { label: 'Baja', badge: 'bg-slate-100 text-slate-600' },
  normal: { label: 'Normal', badge: 'bg-blue-50 text-blue-700' },
  high: { label: 'Alta', badge: 'bg-rose-50 text-rose-700' },
};

export const NAV_ITEMS = [
  { label: 'Resumen', href: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Mis solicitudes', href: ROUTES.REQUESTS, icon: 'FileText' },
  { label: 'Bandeja de entrada', href: ROUTES.INBOX, icon: 'Inbox' },
] as const;

export const MANAGEMENT_NAV_ITEMS = [
  { label: 'Workflows', href: ROUTES.WORKFLOWS, icon: 'Workflow' },
  { label: 'Equipo', href: ROUTES.TEAM, icon: 'Users' },
  { label: 'Configuración', href: ROUTES.SETTINGS, icon: 'Settings' },
] as const;
