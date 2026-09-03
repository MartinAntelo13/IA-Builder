import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants";
import { env } from "@/lib/env";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">
        Bienvenido a {APP_NAME}
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Proyecto Next.js 15 + TypeScript + Tailwind CSS v4
      </p>
      {/* <p className="mb-8 text-sm text-muted-foreground">
        APP_URL: {env.NEXT_PUBLIC_APP_URL}
      </p> */}
      <Button>
        Comenzar
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </main>
  );
}
