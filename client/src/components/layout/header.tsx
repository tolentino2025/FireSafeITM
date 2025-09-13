import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flame, Bell, User, Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Header() {
  const [location] = useLocation();
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Theme management - bootstrap already handled system preference
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Handle mobile menu effects
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      // Simple focus trap - focus first focusable element
      setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector('a, button') as HTMLElement;
        firstFocusable?.focus();
      }, 100);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const navClass = (path: string) =>
    location === path
      ? "text-primary font-medium border-b-2 border-primary pb-1"
      : "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer" data-testid="link-home">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Flame className="text-primary-foreground w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">FireSafe ITM</h1>
                <p className="text-xs text-muted-foreground">NFPA 25 Compliance</p>
              </div>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              className={navClass("/")}
              data-testid="nav-dashboard"
            >
              Painel de Controle
            </Link>
            <Link 
              href="/inspection"
              className={navClass("/inspection")}
              data-testid="nav-inspections"
            >
              Inspeções
            </Link>
            <Link 
              href="/sprinkler-module"
              className={navClass("/sprinkler-module")}
              data-testid="nav-sprinkler-module"
            >
              Sistemas de Sprinklers
            </Link>
            <Link 
              href="/pump-module"
              className={navClass("/pump-module")}
              data-testid="nav-pump-module"
            >
              Bombas de Incêndio
            </Link>
            <Link 
              href="/certificates-module"
              className={navClass("/certificates-module")}
              data-testid="nav-certificates-module"
            >
              Certificados
            </Link>
            <Link 
              href="/standpipe-module"
              className={navClass("/standpipe-module")}
              data-testid="nav-standpipe-module"
            >
              Hidrantes
            </Link>
            <Link 
              href="/painel-controle"
              className={navClass("/painel-controle")}
              data-testid="nav-reports"
            >
              Histórico
            </Link>
            {/* TODO: Restringir por ownerUserId futuramente */}
            {user ? (
              <Link 
                href="/companies"
                className={navClass("/companies")}
                data-testid="link-companies"
              >
                Empresas
              </Link>
            ) : null}
            <Link 
              href="/settings"
              className={navClass("/settings")}
              data-testid="link-settings"
            >
              Configurações
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(true)}
            data-testid="button-mobile-menu"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              onClick={toggleTheme}
              data-testid="button-theme"
              aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              data-testid="button-notifications"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <User className="text-secondary-foreground w-4 h-4" />
              </div>
              <span 
                className="text-sm font-medium hidden sm:block"
                data-testid="text-user-name"
              >
                {(user as any)?.fullName || "Inspetor"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div 
            ref={drawerRef}
            className="fixed inset-y-0 left-0 w-80 max-w-[85%] bg-[var(--surface)] shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Flame className="text-primary-foreground w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">FireSafe ITM</h2>
                  <p className="text-xs text-muted-foreground">NFPA 25 Compliance</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="button-close-mobile-menu"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col p-4 space-y-2">
              <Link 
                href="/"
                className={navClass("/")}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="nav-dashboard-mobile"
              >
                Painel de Controle
              </Link>
              <Link 
                href="/inspection"
                className={navClass("/inspection")}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="nav-inspections-mobile"
              >
                Inspeções
              </Link>
              <Link 
                href="/sprinkler-module"
                className={navClass("/sprinkler-module")}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="nav-sprinkler-module-mobile"
              >
                Sistemas de Sprinklers
              </Link>
              <Link 
                href="/pump-module"
                className={navClass("/pump-module")}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="nav-pump-module-mobile"
              >
                Bombas de Incêndio
              </Link>
              <Link 
                href="/certificates-module"
                className={navClass("/certificates-module")}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="nav-certificates-module-mobile"
              >
                Certificados
              </Link>
              <Link 
                href="/standpipe-module"
                className={navClass("/standpipe-module")}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="nav-standpipe-module-mobile"
              >
                Hidrantes
              </Link>
              <Link 
                href="/painel-controle"
                className={navClass("/painel-controle")}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="nav-reports-mobile"
              >
                Histórico
              </Link>
              {user ? (
                <Link 
                  href="/companies"
                  className={navClass("/companies")}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid="link-companies-mobile"
                >
                  Empresas
                </Link>
              ) : null}
              <Link 
                href="/settings"
                className={navClass("/settings")}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-settings-mobile"
              >
                Configurações
              </Link>
            </nav>

            {/* Mobile User Actions */}
            <div className="border-t border-border p-4 space-y-3">
              <Button
                variant="ghost"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 w-full justify-start"
                onClick={toggleTheme}
                data-testid="button-theme-mobile"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Modo Claro' : 'Modo Escuro'}
              </Button>
              <Button
                variant="ghost"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 w-full justify-start"
                data-testid="button-notifications-mobile"
              >
                <Bell className="w-4 h-4" />
                Notificações
              </Button>
              <div className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <User className="text-secondary-foreground w-4 h-4" />
                </div>
                <span 
                  className="text-sm font-medium"
                  data-testid="text-user-name-mobile"
                >
                  {(user as any)?.fullName || "Inspetor"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
