import { z } from 'zod';

// Forma común de { password, confirmPassword }. Se guarda como constante para
// reutilizarla en dos schemas sin tener que extender un objeto ya refinado
// con .refine() (ver changePasswordSchema).
const basePasswordShape = {
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
};

// Schema para el formulario de "Creá tu contraseña" (/set-password y /reset-password).
// No usa .default('') para no romper la inferencia del zodResolver de zod 4.
export const passwordSchema = z
  .object(basePasswordShape)
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

// Schema para el diálogo "Cambiar contraseña" en Settings: pide la contraseña
// actual, exige que la nueva sea distinta y que coincida con la repetición.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual'),
    ...basePasswordShape,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.password !== data.currentPassword, {
    message: 'La nueva contraseña debe ser distinta de la actual',
    path: ['password'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
