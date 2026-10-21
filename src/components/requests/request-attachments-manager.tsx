// Regla 3: 'use client' — useTransition para subir/quitar adjuntos, useRef para el <input type="file">.
'use client';

import { useRef, useState, useTransition } from 'react';
import { Paperclip, Download, Trash2, UploadCloud } from 'lucide-react';
import { formatBytes } from '@/lib/format-helpers';
import { ATTACHMENT_ACCEPT, ATTACHMENT_HINT } from '@/constants';
import { validateAttachmentFile } from '@/lib/validations/attachment-file';
import { addAttachment, removeAttachment } from '@/app/(dashboard)/requests/[id]/attachment-actions';
import { requestAttachmentHref } from '@/lib/routes';

interface Attachment {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  created_at: string;
}

interface RequestAttachmentsManagerProps {
  requestId: string;
  attachments: Attachment[];
  canEdit: boolean;
}

const FILE_BADGE: Record<string, string> = {
  pdf: 'text-danger bg-danger-bg',
  img: 'text-success bg-success-bg',
  xls: 'text-success bg-success-bg',
  doc: 'text-primary bg-background',
  file: 'text-muted bg-border',
};

function getFileBadge(mimeType: string): { cls: string; label: string } {
  if (mimeType.includes('pdf')) return { cls: 'pdf', label: 'PDF' };
  if (mimeType.includes('image')) return { cls: 'img', label: 'IMG' };
  if (mimeType.includes('spreadsheet')) return { cls: 'xls', label: 'XLS' };
  if (mimeType.includes('word')) return { cls: 'doc', label: 'DOC' };
  return { cls: 'file', label: 'FILE' };
}

const CARD = 'bg-card border border-border rounded-lg shadow-sm p-6 max-md:p-4';
const CARD_TITLE = 'flex items-center gap-2 pb-4 mb-4 border-b border-border text-primary';

export function RequestAttachmentsManager({ requestId, attachments, canEdit }: RequestAttachmentsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!canEdit && attachments.length === 0) return null;

  function handleAdd(files: File[]) {
    setError(null);
    if (files.length === 0) return;
    for (const file of files) {
      const v = validateAttachmentFile(file);
      if (!v.ok) {
        setError(v.error);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
    }
    startTransition(async () => {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const result = await addAttachment(requestId, fd);
        if (!result.ok) {
          setError(`${file.name}: ${result.error}`);
          break;
        }
      }
      if (inputRef.current) inputRef.current.value = '';
    });
  }

  function handleRemove(attachmentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeAttachment(requestId, attachmentId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <article className={CARD}>
      <div className={CARD_TITLE}>
        <Paperclip size={16} />
        <h2 className="m-0 text-foreground text-sm tracking-tight">
          Archivos adjuntos{' '}
          <small className="text-muted text-2xs font-medium">({attachments.length})</small>
        </h2>
      </div>

      {attachments.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 mt-4 max-md:grid-cols-1">
          {attachments.map((att) => {
            const { cls, label } = getFileBadge(att.mime_type);
            return (
              <div key={att.id} className="flex items-center gap-2 min-w-0 p-2.5 text-muted bg-surface border border-border rounded-md">
                <div className={`w-7 h-8 grid place-items-center rounded text-2xs font-extrabold shrink-0 ${FILE_BADGE[cls]}`}>
                  {label}
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block overflow-hidden text-foreground text-2xs font-bold truncate">{att.file_name}</strong>
                  <small className="block mt-1 text-muted text-2xs">{formatBytes(att.size_bytes)}</small>
                </div>
                <a
                  href={requestAttachmentHref(requestId, att.id)}
                  aria-label={`Descargar ${att.file_name}`}
                  className="ml-auto text-muted hover:text-primary shrink-0"
                >
                  <Download size={14} />
                </a>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemove(att.id)}
                    disabled={isPending}
                    aria-label={`Quitar ${att.file_name}`}
                    className="text-muted hover:text-danger shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="m-0 text-2xs text-muted text-center py-3">No hay archivos adjuntos todavía.</p>
      )}

      {canEdit && (
        <label className="dropzone mt-4" htmlFor="add-attachment">
          <UploadCloud size={20} />
          <strong>{isPending ? 'Subiendo…' : 'Agregar archivos'}</strong>
          <small>{ATTACHMENT_HINT}</small>
          <input
            ref={inputRef}
            id="add-attachment"
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            disabled={isPending}
            onChange={(e) => handleAdd(Array.from(e.target.files ?? []))}
          />
        </label>
      )}

      {error && <p className="mt-3 text-2xs text-danger">{error}</p>}
    </article>
  );
}
