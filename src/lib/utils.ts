import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS de forma inteligente.
 * Resuelve conflictos entre clases utilitarias.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
