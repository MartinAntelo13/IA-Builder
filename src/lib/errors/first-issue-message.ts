import type { ZodError } from 'zod';

export function firstIssueMessage(error: ZodError, fallback = 'Datos inválidos.'): string {
  return error.issues[0]?.message ?? fallback;
}
