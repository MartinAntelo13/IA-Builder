import type { RequestFormValues } from '@/lib/validations/request.schema';

export function buildRequestFormData(values: RequestFormValues): FormData {
  const fd = new FormData();
  fd.append('request_type_id', values.request_type_id);
  fd.append('title', values.title);
  fd.append('description', values.description);
  if (values.cost_center_id) fd.append('cost_center_id', values.cost_center_id);
  fd.append('priority', values.priority);
  if (values.amount != null) fd.append('amount', String(values.amount));
  for (const file of values.attachments) fd.append('attachments', file);
  return fd;
}
