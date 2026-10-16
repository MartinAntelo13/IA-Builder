import { getCurrentProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { getUserPermissions } from "@/lib/auth/permissions";
import { getDashboardKpis } from "@/lib/dashboard/get-dashboard-kpis";
import { PERMISSIONS } from "@/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return redirect("/login");
  }

  // getUserPermissions sigue propagando errores (los atrapa src/app/error.tsx).
  // getDashboardKpis es decorativo acá: el badge cae a 0 si el RPC falla;
  // la página `/` sí lanza el error del mismo RPC a su error.tsx.
  const [permissions, kpisResult] = await Promise.all([
    getUserPermissions(),
    getDashboardKpis(),
  ]);
  const canManageWorkflows = permissions.has(PERMISSIONS.WORKFLOW_MANAGE);
  const canManageTeam = permissions.has(PERMISSIONS.TEAM_MANAGE);
  const awaitingMyReview = kpisResult.error
    ? 0
    : kpisResult.data?.awaiting_my_review ?? 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={profile}
        canManageWorkflows={canManageWorkflows}
        canManageTeam={canManageTeam}
        className="w-17 md:w-64 shrink-0 border-r transition-all"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar awaitingMyReview={awaitingMyReview} />
        <main className="flex-1 overflow-y-auto bg-surface">{children}</main>
      </div>
    </div>
  );
}
