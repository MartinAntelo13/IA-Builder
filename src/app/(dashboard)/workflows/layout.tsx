import { notFound } from 'next/navigation';
import { hasPermission } from '@/lib/auth/permissions';
import { PERMISSIONS } from '@/constants';

export default async function WorkflowsLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasPermission(PERMISSIONS.WORKFLOW_MANAGE))) notFound();
  return <>{children}</>;
}
