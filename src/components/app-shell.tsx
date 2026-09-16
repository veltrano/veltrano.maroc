import { CartProvider } from "@/lib/cart";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WelcomePopup } from "@/components/welcome-popup";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <SiteHeader />
        <main className="flex-1 bg-white">{children}</main>
        <SiteFooter />
        <WelcomePopup />
      </div>
    </CartProvider>
  );
}
