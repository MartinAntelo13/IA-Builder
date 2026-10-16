import { Workflow } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { transformWorkflow } from '@/lib/transformers/workflows';
import type { WorkflowFromQuery } from '@/lib/transformers/workflows';
import { WorkflowList } from '@/components/workflows/workflow-list';
import { WorkflowDetail } from '@/components/workflows/workflow-detail';
import { UUID_RE } from '@/lib/validators/uuid';
import { loadWorkflowDetails } from '@/lib/workflows/load-workflow-details';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(val: string | string[] | undefined): string {
  return typeof val === 'string' ? val : '';
}

export default async function WorkflowsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawId = getString(params.id);

  const supabase = await createSupabaseServerClient();

  // EXCEPTION (Regla 10): no existe RPC de lectura de workflows ni de catálogos
  // (roles / profiles activos / user_roles). RLS filtra por organización.
  const [workflowsResult, requestTypesResult, rolesResult, profilesResult, userRolesResult] =
    await Promise.all([
      supabase
        .from('workflows')
        .select('id, name, description, is_active, updated_at, workflow_steps(count)')
        .order('name'),
      supabase
        .from('request_types')
        .select('id, name, workflow_id'),
      supabase
        .from('roles')
        .select('id, name')
        .order('name'),
      supabase
        .from('profiles')
        .select('id, full_name')
        .eq('status', 'active')
        .order('full_name'),
      supabase
        .from('user_roles')
        .select('role_id, user_id'),
    ]);

  if (workflowsResult.error) throw new Error(workflowsResult.error.message);
  if (requestTypesResult.error) throw new Error(requestTypesResult.error.message);
  if (rolesResult.error) throw new Error(rolesResult.error.message);
  if (profilesResult.error) throw new Error(profilesResult.error.message);
  if (userRolesResult.error) throw new Error(userRolesResult.error.message);

  const rawWorkflows = (workflowsResult.data ?? []) as WorkflowFromQuery[];
  const workflows = rawWorkflows.map(transformWorkflow);
  const requestTypes = requestTypesResult.data ?? [];
  const roleOptions = (rolesResult.data ?? []).map((r) => ({ id: r.id, name: r.name }));
  const userOptions = (profilesResult.data ?? []).map((u) => ({
    id: u.id,
    name: u.full_name,
  }));

  const activeUserIds = new Set((profilesResult.data ?? []).map((u) => u.id));
  const roleIdsWithActiveUsers = [
    ...new Set(
      (userRolesResult.data ?? [])
        .filter((ur) => activeUserIds.has(ur.user_id))
        .map((ur) => ur.role_id),
    ),
  ];

  const usedByMap: Record<string, string[]> = {};
  for (const rt of requestTypes) {
    if (!rt.workflow_id) continue;
    (usedByMap[rt.workflow_id] ??= []).push(rt.name);
  }

  const selectedId =
    rawId && UUID_RE.test(rawId) && workflows.some((w) => w.id === rawId)
      ? rawId
      : workflows[0]?.id ?? null;

  const selectedWorkflow = workflows.find((w) => w.id === selectedId) ?? null;

  const { steps, usedByTypes } =
    selectedId && selectedWorkflow
      ? await loadWorkflowDetails(supabase, selectedId, requestTypes)
      : { steps: [], usedByTypes: [] };

  return (
    <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12">
      <header className="mb-6">
        <p className="text-2xs font-bold tracking-wider text-muted uppercase">
          GESTIÓN DEL ESPACIO DE TRABAJO
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight mt-0.5">Workflows</h1>
        <p className="text-2xs text-muted mt-1">
          Configura los flujos de aprobación para tus solicitudes.
        </p>
      </header>

      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-border rounded-lg shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center">
            <Workflow size={20} className="text-primary" />
          </div>
          <p className="text-sm text-muted text-center">No hay workflows configurados todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
          <aside className="w-full lg:w-72 shrink-0">
            <WorkflowList workflows={workflows} selectedId={selectedId} usedByMap={usedByMap} />
          </aside>
          <section className="w-full lg:flex-1 min-w-0">
            {selectedWorkflow ? (
              <WorkflowDetail
                workflow={selectedWorkflow}
                steps={steps}
                usedByTypes={usedByTypes}
                roleOptions={roleOptions}
                userOptions={userOptions}
                roleIdsWithActiveUsers={roleIdsWithActiveUsers}
              />
            ) : (
              <p className="text-2xs text-muted">Seleccioná un workflow para ver su detalle.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
