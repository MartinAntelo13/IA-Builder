import type { Database } from '@/types/database.types';
import type { RequestDetailData } from '@/types/request-detail';

/**
 * Fila completa devuelta por el RPC list_requests (tipo generado por Supabase).
 */
type ListRequestsRow = Database['public']['Functions']['list_requests']['Returns'][number];

/**
 * Regla 7: en vez de duplicar a mano los campos que usa este transformer,
 * se seleccionan (Pick) directamente desde el tipo generado por Supabase.
 * Si el RPC cambia de forma, este Pick deja de compilar en vez de desincronizarse
 * silenciosamente de la base real.
 */
type ListRequestsRowSubset = Pick<
  ListRequestsRow,
  | 'id'
  | 'code'
  | 'title'
  | 'request_type_code'
  | 'request_type_name'
  | 'requester_name'
  | 'amount'
  | 'currency_symbol'
  | 'status'
  | 'submitted_at'
  | 'created_at'
  | 'current_step_label'
>;

/**
 * Transforma los datos del RPC list_requests (snake_case)
 * al formato esperado por RequestRow (camelCase)
 */
export function transformRequestRow(data: ListRequestsRowSubset) {
  if (!data || typeof data !== 'object') {
    console.warn('[transformRequestRow] Invalid data:', data);
    throw new Error('Invalid request data');
  }
  
  return {
    id: data.id ?? '',
    code: data.code ?? '',
    title: data.title ?? '',
    requestTypeCode: data.request_type_code ?? '',
    requestTypeName: data.request_type_name ?? '',
    requesterName: data.requester_name ?? '',
    amount: data.amount ?? null,
    currencySymbol: data.currency_symbol ?? null,
    status: data.status ?? 'unknown',
    submittedAt: data.submitted_at ?? data.created_at ?? null,
    currentStepLabel: data.current_step_label ?? null,
  };
}

/**
 * Tipo de salida de transformRequestRow, exportado para que los componentes
 * (p. ej. requests-table.tsx) lo importen en vez de redefinir una interface
 * manual duplicada (Regla 7).
 */
export type RequestRow = ReturnType<typeof transformRequestRow>;

type Approval = RequestDetailData['approvals'][number];

// Devuelve el comentario de la decisión 'changes_requested' más reciente, o null.
export function findChangesComment(
  approvals: Approval[],
): { comment: string; decidedByName: string } | null {
  const match = approvals
    .filter((a) => a.decision === 'changes_requested' && a.comment)
    .sort((a, b) => b.decided_at.localeCompare(a.decided_at))[0];
  if (!match?.comment) return null;
  return { comment: match.comment, decidedByName: match.decided_by_name };
}

/**
 * Transforma un array de datos del RPC al formato esperado
 */
export function transformRequestRows(data: ListRequestsRowSubset[]) {
  if (!data) {
    console.warn('[transformRequestRows] Data is null or undefined');
    return [];
  }
  
  if (!Array.isArray(data)) {
    console.warn('[transformRequestRows] Data is not an array:', typeof data);
    return [];
  }
  
  try {
    const transformed = data.map((row) => {
      try {
        return transformRequestRow(row);
      } catch (error) {
        console.error('[transformRequestRows] Error transforming individual row:', error, 'Row:', row);
        return null;
      }
    }).filter((row): row is ReturnType<typeof transformRequestRow> => row !== null);
    
    return transformed;
  } catch (error) {
    console.error('[transformRequestRows] Error transforming rows:', error);
    return [];
  }
}
