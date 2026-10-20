// Política C19: centraliza la traducción de errores de Supabase/PostgREST/RPC
// al usuario. P0001 es el ERRCODE de `raise exception` (y el valor por defecto
// cuando no se indica errcode en PL/pgSQL), por lo que solo ese código pasa el
// mensaje de la excepción — todos los mensajes P0001 están escritos en español
// por convención del proyecto.
// P0001, P0002 y PGRST116 no se loguean: son resultados esperados del negocio,
// no errores internos.

export interface UserErrorSource {
  code?: string | undefined;
  message: string;
}

export interface UserErrorOptions {
  label: string;
  fallback: string;
  forbidden?: string;
  notFound?: string;
}

export function toUserError(error: UserErrorSource, options: UserErrorOptions): string {
  const { code, message } = error;

  if (code === 'P0001') return message || options.fallback;
  if (code === 'P0002') return options.notFound ?? 'No se encontró el elemento solicitado.';
  // PGRST116 = fila no encontrada en .single(); mismo tratamiento que P0002.
  if (code === 'PGRST116') return options.notFound ?? 'No se encontró el elemento solicitado.';

  // Para cualquier otro código: registrar para diagnóstico, nunca exponer el mensaje.
  console.error(options.label, { code, message });

  if (code === '42501') return options.forbidden ?? 'No tenés permisos para realizar esta acción.';
  if (code === '28000') return 'Tu sesión expiró. Volvé a iniciar sesión.';
  if (code === '23505') return 'Ya existe un registro con esos datos.';
  if (code === '23503') return 'No se pudo completar la operación porque hay datos relacionados.';

  return options.fallback;
}
