import type { Database } from '@/types/database.types';

type ListInboxRow = Database['public']['Functions']['list_inbox']['Returns'][number];
type GetInboxKpisRow = Database['public']['Functions']['get_inbox_kpis']['Returns'][number];

export function transformInboxRow(row: ListInboxRow) {
  return {
    requestId: row.request_id,
    code: row.code,
    title: row.title,
    description: row.description ?? null,
    requestTypeCode: row.request_type_code,
    requesterName: row.requester_name,
    amount: row.amount ?? 0,
    currencyCode: row.currency_code,
    currencySymbol: row.currency_symbol,
    priority: row.priority,
    status: row.status,
    stepLabel: row.step_label ?? null,
    stepActivatedAt: row.step_activated_at ?? null,
    stepDueAt: row.step_due_at ?? null,
    isOverdue: row.is_overdue ?? false,
    myDecision: (row.my_decision ?? null) as Database['public']['Enums']['decision_type'] | null,
    myDecidedAt: row.my_decided_at ?? null,
    totalCount: row.total_count,
  };
}

export type InboxRow = ReturnType<typeof transformInboxRow>;

export function transformInboxKpis(row: GetInboxKpisRow) {
  return {
    pendingCount: row.pending_count ?? null,
    highPriorityCount: row.high_priority_count ?? null,
    avgResponseDays: row.avg_response_days ?? null,
    slaCompliancePct: row.sla_compliance_pct ?? null,
  };
}

export type InboxKpis = ReturnType<typeof transformInboxKpis>;
