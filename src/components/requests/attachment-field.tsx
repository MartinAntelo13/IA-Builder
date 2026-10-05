// 'use client' - sub-componente del formulario, usado exclusivamente desde new-request-form (Client)
'use client';

import { UploadCloud } from 'lucide-react';

interface AttachmentFieldProps {
  files: File[];
  error?: string;
  onChange: (files: File[]) => void;
}

export function AttachmentField({ files, error, onChange }: AttachmentFieldProps) {
  return (
    <div className="field">
      <span className="field-label">Documentos adjuntos</span>
      <label className="dropzone" htmlFor="req-files">
        <UploadCloud size={24} />
        <strong>
          {files.length > 0
            ? `${files.length} archivo(s) seleccionado(s)`
            : 'Arrastra archivos aquí o haz clic para seleccionar'}
        </strong>
        <small>PDF, XLSX o imágenes, máx. 10MB</small>
        <input
          id="req-files"
          type="file"
          multiple
          accept=".pdf,.xlsx,image/*"
          onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        />
      </label>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
