// Regla 3: 'use client' — useState para el estado de arrastre (isDragging) de la zona de soltar.
'use client';

import { useState, type DragEvent } from 'react';

interface FileDropProps {
  onDragEnter: (e: DragEvent<HTMLElement>) => void;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDragLeave: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
}

export function useFileDrop(onFiles: (files: File[]) => void): {
  isDragging: boolean;
  dropProps: FileDropProps;
} {
  const [isDragging, setIsDragging] = useState(false);

  const dropProps: FileDropProps = {
    onDragEnter: (e) => {
      e.preventDefault();
      if (Array.from(e.dataTransfer.types).includes('Files')) setIsDragging(true);
    },
    onDragOver: (e) => {
      e.preventDefault();
    },
    onDragLeave: (e) => {
      // dragleave también dispara al pasar sobre elementos hijos: sólo apagar al salir de la zona.
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      setIsDragging(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
  };

  return { isDragging, dropProps };
}
