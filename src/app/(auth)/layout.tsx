import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

/**
 * Layout del grupo (auth): login y forgot-password.
 * Incluye Navbar + Footer públicos. NO renderiza <html>/<body> (los define el layout raíz).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
