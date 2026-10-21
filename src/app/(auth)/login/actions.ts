'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signinSchema } from '@/lib/schemas/signin.schema';
import { mapSignInError } from '@/lib/auth/map-sign-in-error';
import { firstIssueMessage } from '@/lib/errors/first-issue-message';

export interface SignInResult {
  error?: string;
  success?: boolean;
}

export async function signIn(formData: FormData): Promise<SignInResult> {
  const parsed = signinSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapSignInError(error) };
  }

  // En éxito no llamamos a redirect() desde el servidor: el cliente navega con
  // router.replace() + router.refresh() para evitar que un try/catch alrededor
  // del await capture la señal interna de redirect y la muestre como error.
  return { success: true };
}