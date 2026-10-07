import { Workflow } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { transformWorkflow, transformWorkflowStep } from '@/lib/transformers/workflows';
import type { WorkflowFromQuery, WorkflowStepFromQuery } from '@/lib/transformers/workflows';
import { WorkflowList } from '@/components/workflows/workflow-list';
import { WorkflowDetail } from '@/components/workflows/workflow-detail';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const UUID_RE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

function getString(val: string | string[] | undefined): string {
  return typeof val === 'string' ? val : '';
}

export default async function WorkflowsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawId = getString(params.id);

  const supabase = await createSupabaseServerClient();

  // EXCEPTION (Regla 10): no existe RPC de lectura de workflows.
  // workflows_select y request_types_select permiten SELECT para authenticated.
  const [workflowsResult, requestTypesResult] = await Promise.all([
    supabase
      .from('workflows')
      .select('id, name, description, is_active, updated_at, workflow_steps(count)')
      .order('name'),
    supabase
      .from('request_types')
      .select('id, name, workflow_id'),
  ]);

  if (workflowsResult.error) throw new Error(workflowsResult.error.message);
  if (requestTypesResult.error) throw new Error(requestTypesResult.error.message);

  const rawWorkflows = (workflowsResult.data ?? []) as WorkflowFromQuery[];
  const workflows = rawWorkflows.map(transformWorkflow);
  const requestTypes = requestTypesResult.data ?? [];

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

  let steps: ReturnType<typeof transformWorkflowStep>[] = [];
  let usedByTypes: { id: string; name: string }[] = [];

  if (selectedId && selectedWorkflow) {
    // EXCEPTION (Regla 10): no existe RPC de lectura de workflows.
    const stepsResult = await supabase
      .from('workflow_steps')
      .select('id, position, label, approver_type, role_id, user_id, sla_hours')
      .eq('workflow_id', selectedId)
      .order('position');

    if (stepsResult.error) throw new Error(stepsResult.error.message);

    const rawSteps = (stepsResult.data ?? []) as WorkflowStepFromQuery[];
    const roleIds = [...new Set(rawSteps.flatMap((s) => (s.role_id ? [s.role_id] : [])))];
    const userIds = [...new Set(rawSteps.flatMap((s) => (s.user_id ? [s.user_id] : [])))];

    const [rolesResult, usersResult] = await Promise.all([
      roleIds.length > 0
        ? supabase.from('roles').select('id, name').in('id', roleIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[], error: null }),
      userIds.length > 0
        ? supabase.from('profiles').select('id, full_name').in('id', userIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string }[], error: null }),
    ]);

    if (rolesResult.error) throw new Error(rolesResult.error.message);
    if (usersResult.error) throw new Error(usersResult.error.message);

    const roleNames = Object.fromEntries((rolesResult.data ?? []).map((r) => [r.id, r.name]));
    const userNames = Object.fromEntries((usersResult.data ?? []).map((u) => [u.id, u.full_name]));

    steps = rawSteps.map((s) => transformWorkflowStep(s, roleNames, userNames));
    usedByTypes = requestTypes
      .filter((rt) => rt.workflow_id === selectedId)
      .map((rt) => ({ id: rt.id, name: rt.name }));
  }

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
