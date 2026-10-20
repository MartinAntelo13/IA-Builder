// Validación de servidor compartida por createRequest, submitRequest y updateRequest.
// La action nunca confía en el cliente: arma el input desde el FormData y lo valida
// con editRequestSchema (los mismos campos que el formulario, sin attachments).
import { editRequestSchema } from '@/lib/validations/request.schema';
import type { EditRequestFormValues } from '@/lib/validations/request.schema';

type ParseOk = { ok: true; data: EditRequestFormValues };
type ParseFail = { ok: false; error: string };

function readText(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

// Rechazo explícito de NaN e Infinity antes del schema: z.number() acepta NaN
// porque typeof NaN === 'number'.
function parseAmount(raw: FormDataEntryValue | null): { ok: true; value: number | null } | { ok: false } {
  if (raw === null || raw === '') return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false };
  const n = Number(raw);
  return Number.isFinite(n) ? { ok: true, value: n } : { ok: false };
}

export function parseRequestFormData(formData: FormData): ParseOk | ParseFail {
  const amountResult = parseAmount(formData.get('amount'));
  if (!amountResult.ok) return { ok: false, error: 'El importe no es un número válido.' };

  // readText ya hace trim: así .min(1) del schema rechaza valores de solo espacios.
  const input = {
    request_type_id: readText(formData, 'request_type_id'),
    title: readText(formData, 'title'),
    description: readText(formData, 'description'),
    amount: amountResult.value,
    cost_center_id: readText(formData, 'cost_center_id') || null,
    priority: readText(formData, 'priority'),
  };

  const parsed = editRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }
  return { ok: true, data: parsed.data };
}
