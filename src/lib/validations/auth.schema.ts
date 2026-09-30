import { z } from 'zod';

/**
 * Criterio compartido de validación de email.
 * Se reutiliza en todos los schemas de autenticación.
 */
const emailCriterion = z.string().email({ message: 'Email inválido' });

/**
 * Login form validation schema.
 * Email must be valid, password minimum 8 characters.
 */
export const loginSchema = z.object({
  email: emailCriterion,
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Forgot password form validation schema.
 * Email must be valid.
 */
export const forgotPasswordSchema = z.object({
  email: emailCriterion,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;