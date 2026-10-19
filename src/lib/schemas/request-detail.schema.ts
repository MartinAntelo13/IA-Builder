import { z } from 'zod';
import { Constants } from '@/types/database.types';

const { Enums } = Constants.public;

export const requestDetailSchema = z.object({
  request: z.object({
    id: z.string(),
    code: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    amount: z.number().nullable(),
    priority: z.enum(Enums.priority_level),
    status: z.enum(Enums.request_status),
    submitted_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    requester_id: z.string(),
    request_type_id: z.string(),
    cost_center_id: z.string().nullable(),
    workflow_id: z.string().nullable(),
    current_step_id: z.string().nullable(),
    required_date: z.string().nullable(),
    revision: z.number(),
    completed_at: z.string().nullable(),
  }),
  request_type: z.object({
    code: z.string(),
    name: z.string(),
    description: z.string().nullable(),
  }),
  requester: z.object({
    id: z.string(),
    full_name: z.string(),
    email: z.string(),
    job_title: z.string().nullable(),
    department_name: z.string().nullable(),
    department_code: z.string().nullable(),
  }),
  cost_center: z
    .object({
      code: z.string(),
      name: z.string(),
      label: z.string(),
    })
    .nullable(),
  currency: z.object({
    code: z.string(),
    symbol: z.string(),
  }),
  steps: z.array(
    z.object({
      id: z.string(),
      position: z.number(),
      label: z.string(),
      status: z.enum(Enums.step_status),
      approver_type: z.enum(Enums.approver_type),
      role_id: z.string().nullable(),
      role_name: z.string().nullable(),
      assigned_to: z.string().nullable(),
      assigned_to_name: z.string().nullable(),
      activated_at: z.string().nullable(),
      due_at: z.string().nullable(),
      decided_at: z.string().nullable(),
    })
  ),
  approvals: z.array(
    z.object({
      id: z.string(),
      step_id: z.string(),
      step_label: z.string(),
      revision: z.number(),
      decision: z.enum(Enums.decision_type),
      comment: z.string().nullable(),
      decided_at: z.string(),
      decided_by: z.string(),
      decided_by_name: z.string(),
    })
  ),
  attachments: z.array(
    z.object({
      id: z.string(),
      file_name: z.string(),
      mime_type: z.string(),
      size_bytes: z.number(),
      storage_path: z.string(),
      created_at: z.string(),
    })
  ),
  comments: z.array(
    z.object({
      id: z.string(),
      body: z.string(),
      created_at: z.string(),
      author_id: z.string(),
      author_name: z.string(),
      author_roles: z.array(z.string()),
    })
  ),
  events: z.array(
    z.object({
      id: z.number(),
      event_type: z.enum(Enums.event_type),
      metadata: z.record(z.string(), z.unknown()),
      created_at: z.string(),
      actor_id: z.string().nullable(),
      actor_name: z.string(),
    })
  ),
  viewer: z.object({
    can_decide: z.boolean(),
    can_edit: z.boolean(),
    can_submit: z.boolean(),
    can_resubmit: z.boolean(),
    can_cancel: z.boolean(),
  }),
});

export type RequestDetailData = z.infer<typeof requestDetailSchema>;
