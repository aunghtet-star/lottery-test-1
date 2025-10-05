import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';
export function HomePage() {
  // Initialize theme
  useTheme();
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr] lg:grid-cols-[256px_1fr]">
      <Sidebar />
      <div className="flex flex-col max-h-screen overflow-hidden">
        <Header />
        <main className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
      <Toaster richColors closeButton />
    </div>
  );
}