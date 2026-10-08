import { z } from 'zod';

// Schema para el formulario de invitación. No usa .default('') (rompe la
// inferencia de zodResolver en zod 4).
export const inviteSchema = z.object({
  email: z.string().trim().email('Ingresá un email válido'),
  fullName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'Máximo 100 caracteres'),
  roleCode: z.string().min(1, 'Elegí un rol'),
  jobTitle: z.string().trim().max(100, 'Máximo 100 caracteres'),
  departmentId: z.string().nullable(),
  managerId: z.string().nullable(),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;
