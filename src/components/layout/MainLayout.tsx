import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
