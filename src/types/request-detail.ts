import type { Database } from '@/types/database.types';

type RequestStatus = Database['public']['Enums']['request_status'];
type PriorityLevel = Database['public']['Enums']['priority_level'];
type StepStatus = Database['public']['Enums']['step_status'];
type ApproverType = Database['public']['Enums']['approver_type'];
type DecisionType = Database['public']['Enums']['decision_type'];
type RequestEventType = Database['public']['Enums']['event_type'];

export interface RequestDetailData {
  request: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    amount: string | null;
    priority: PriorityLevel;
    status: RequestStatus;
    submitted_at: string | null;
    created_at: string;
    updated_at: string;
    requester_id: string;
    request_type_id: string;
    cost_center_id: string | null;
    workflow_id: string | null;
    current_step_id: string | null;
    required_date: string | null;
    revision: number;
    completed_at: string | null;
  };
  request_type: {
    code: string;
    name: string;
    description: string | null;
  };
  requester: {
    id: string;
    full_name: string;
    email: string;
    job_title: string | null;
    department_name: string | null;
    department_code: string | null;
  };
  cost_center: {
    code: string;
    name: string;
    label: string;
  } | null;
  currency: {
    code: string;
    symbol: string;
  };
  steps: Array<{
    id: string;
    position: number;
    label: string;
    status: StepStatus;
    approver_type: ApproverType;
    role_id: string | null;
    role_name: string | null;
    assigned_to: string | null;
    assigned_to_name: string | null;
    activated_at: string | null;
    due_at: string | null;
    decided_at: string | null;
  }>;
  approvals: Array<{
    id: string;
    step_id: string;
    step_label: string;
    revision: number;
    decision: DecisionType;
    comment: string | null;
    decided_at: string;
    decided_by: string;
    decided_by_name: string;
  }>;
  attachments: Array<{
    id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    storage_path: string;
    created_at: string;
  }>;
  comments: Array<{
    id: string;
    body: string;
    created_at: string;
    author_id: string;
    author_name: string;
    author_roles: string[];
  }>;
  events: Array<{
    id: string;
    event_type: RequestEventType;
    metadata: Record<string, unknown> | null;
    created_at: string;
    actor_id: string | null;
    actor_name: string;
  }>;
  viewer: {
    can_decide: boolean;
    can_edit: boolean;
    can_submit: boolean;
    can_resubmit: boolean;
    can_cancel: boolean;
  };
}
