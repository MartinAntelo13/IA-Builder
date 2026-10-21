import { z } from 'zod';

export const signinSchema = z.object({
  email: z.string().min(1, 'El email es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
