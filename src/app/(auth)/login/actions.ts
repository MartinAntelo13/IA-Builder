'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface SignInResult {
  error?: string;
  success?: boolean;
}

export async function signIn(formData: FormData): Promise<SignInResult> {
  const supabase = await createSupabaseServerClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // En éxito no llamamos a redirect() desde el servidor: el cliente navega con
  // router.replace() + router.refresh() para evitar que un try/catch alrededor
  // del await capture la señal interna de redirect y la muestre como error.
  return { success: true };
}