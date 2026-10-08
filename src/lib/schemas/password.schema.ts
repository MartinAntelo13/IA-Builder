import { z } from 'zod';

// Schema para el formulario de "Creá tu contraseña" (/set-password).
// No usa .default('') para no romper la inferencia del zodResolver de zod 4.
export const passwordSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;
