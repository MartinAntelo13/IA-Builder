import Link from 'next/link';
import { APP_NAME } from '@/constants';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          {APP_NAME}
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}