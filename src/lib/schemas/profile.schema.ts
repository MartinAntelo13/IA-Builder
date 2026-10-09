import { z } from 'zod';

// Schema del formulario "Perfil personal" de /settings.
// Columnas tocadas en profiles (coinciden con los grants por columna del SQL):
// full_name y timezone. El email y los roles se muestran en modo lectura.
// No usa .default('') (rompe el inferido de zodResolver en zod 4).
export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(120, 'Máximo 120 caracteres'),
  // '' → se guarda null (usar la zona de la organización); si no, string válido.
  timezone: z.string().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
