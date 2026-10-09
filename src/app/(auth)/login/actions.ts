'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';

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
  
  redirect(ROUTES.HOME);
}