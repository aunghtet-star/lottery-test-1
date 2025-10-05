import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  PenSquare,
  BookOpen,
  Users,
  Settings,
  Menu,
  Gem,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/entry', label: 'Bet Entry', icon: PenSquare },
  { href: '/ledger', label: 'Sales Ledger', icon: BookOpen },
  { href: '/agents', label: 'Agent Management', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/limits', label: 'Limits/Breaks', icon: ShieldAlert },
  { href: '/settings', label: 'Settings', icon: Settings },
];
const NavContent = () => {
  const location = useLocation();
  return (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      <div className="flex h-16 items-center border-b px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <Gem className="h-6 w-6 text-primary" />
          <span className="text-lg font-display">Zenith Ledger</span>
        </NavLink>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-4 py-4 text-sm font-medium">
          {navItems.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  (isActive || (href === '/' && location.pathname === '/')) && 'bg-muted text-primary'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <p className="text-center text-xs text-muted-foreground">
          Built with ❤️ at Cloudflare
        </p>
      </div>
    </div>
  );
};
export const Sidebar = () => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64">
          <SheetHeader className="sr-only">
            <SheetTitle>Zenith Ledger Navigation</SheetTitle>
            <SheetDescription>
              Main navigation menu for the Zenith Ledger application.
            </SheetDescription>
          </SheetHeader>
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <NavContent />
    </aside>
  );
};