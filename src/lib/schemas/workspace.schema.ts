import { z } from 'zod';

// Schema del formulario "Espacio de trabajo" de /settings.
// Columnas tocadas en organizations coincidentes con los grants por columna
// del SQL: name, domain, description, currency_code, currency_symbol,
// timezone, support_email. El slug NO se edita.
//
// Reglas tomadas del SQL (no inventadas): name no vacío (NOT NULL + check
// length(trim(name)) > 0), currency_code ^[A-Z]{3}$, currency_symbol 1..4.
// No usa .default('') (rompe la inferencia de zodResolver en zod 4).

const DOMAIN_RE = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+$/;

export const workspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(120, 'Máximo 120 caracteres'),
  // '' → null al guardar; si no, hostname en minúsculas.
  domain: z
    .string()
    .trim()
    .max(253, 'Máximo 253 caracteres')
    .refine((v) => v === '' || DOMAIN_RE.test(v), {
      message: 'Dominio inválido (ej. "empresa.com")',
    }),
  description: z.string().trim().max(500, 'Máximo 500 caracteres'),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'Debe ser un código ISO de 3 letras mayúsculas'),
  currencySymbol: z
    .string()
    .trim()
    .min(1, 'El símbolo es obligatorio')
    .max(4, 'Máximo 4 caracteres'),
  timezone: z.string().min(1, 'Elegí una zona horaria'),
  supportEmail: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: 'Ingresá un email válido',
    }),
});

export type WorkspaceFormValues = z.infer<typeof workspaceSchema>;
