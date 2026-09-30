'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';

export interface ForgotPasswordResult {
  error?: string;
  success?: boolean;
}

export async function forgotPassword(formData: FormData): Promise<ForgotPasswordResult> {
  const supabase = await createSupabaseServerClient();
  
  const email = formData.get('email') as string;
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  // No redirigimos aquí, dejamos que el componente muestre el mensaje de confirmación
  return { success: true };
}