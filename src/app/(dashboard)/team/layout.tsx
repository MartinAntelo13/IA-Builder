import { notFound } from 'next/navigation';
import { hasPermission } from '@/lib/auth/permissions';
import { PERMISSIONS } from '@/constants';

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasPermission(PERMISSIONS.TEAM_MANAGE))) notFound();
  return <>{children}</>;
}
