import { getCurrentProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar sesión y obtener perfil
  const profile = await getCurrentProfile();
  
  if (!profile) {
    return redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={profile} className="w-[68px] md:w-64 shrink-0 border-r transition-all" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#f8f9fd]">{children}</main>
      </div>
    </div>
  );
}