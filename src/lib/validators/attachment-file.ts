// Validación compartida de adjuntos. Los límites coinciden con el bucket
// 'request-attachments' (10 MB, MIME whitelist) y con el bodySizeLimit de
// Server Actions definido en next.config.ts (12 MB). El total ≤ 11 MB deja
// margen de ~1 MB para el overhead multipart de un submit con varios archivos.

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 11 * 1024 * 1024;

const ALLOWED_MIME_TYPES: readonly string[] = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export type AttachmentValidationResult = { ok: true } | { ok: false; error: string };

export function validateAttachmentFile(file: File): AttachmentValidationResult {
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `${file.name}: supera el máximo de 10 MB` };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { ok: false, error: `${file.name}: tipo de archivo no permitido` };
  }
  return { ok: true };
}

export function validateAttachmentFiles(files: File[]): AttachmentValidationResult {
  let total = 0;
  for (const file of files) {
    const r = validateAttachmentFile(file);
    if (!r.ok) return r;
    total += file.size;
  }
  if (total > MAX_TOTAL_BYTES) {
    return { ok: false, error: 'El total de archivos supera los 11 MB. Reducí la cantidad o el tamaño.' };
  }
  return { ok: true };
}
