import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

/**
 * Layout del grupo (public): páginas públicas futuras (landing, etc.).
 * Incluye Navbar + Footer públicos. NO renderiza <html>/<body> (los define el layout raíz).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
