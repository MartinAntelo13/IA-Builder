import { z } from 'zod';

export const requestSchema = z.object({
  request_type_id: z.string().min(1, 'Seleccioná un tipo de solicitud'),
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.number().nonnegative('El importe debe ser positivo').nullable().optional(),
  cost_center_id: z.string().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high'] as const),
  attachments: z.array(z.instanceof(File)),
});

export type RequestFormValues = z.infer<typeof requestSchema>;
