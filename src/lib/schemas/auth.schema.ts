import { z } from 'zod';

// Criterio compartido de validación de email para los formularios de autenticación.
const emailCriterion = z.string().email({ message: 'Email inválido' });

// Formulario de login (cliente): email válido y contraseña de al menos 8 caracteres.
export const loginSchema = z.object({
  email: emailCriterion,
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
});

// Server Action de login: solo exige que los campos no estén vacíos; la credencial
// la valida Supabase Auth.
export const signinSchema = z.object({
  email: z.string().min(1, 'El email es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Formulario "Olvidé mi contraseña": email válido.
export const forgotPasswordSchema = z.object({
  email: emailCriterion,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
