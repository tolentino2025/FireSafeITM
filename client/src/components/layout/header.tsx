import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flame, Bell, User, Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
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

  // Handle mobile menu effects with improved focus management
  useEffect(() => {
    const html = document.documentElement;
    const overlay = document.getElementById('mobile-nav-overlay');
    const drawer = document.getElementById('mobile-nav');
    const btnOpen = document.getElementById('btn-nav');
    
    if (isMobileMenuOpen) {
      // Set data attribute for CSS body scroll lock
      html.setAttribute('data-nav-open', 'true');
      btnOpen?.setAttribute('aria-expanded', 'true');
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
        }
      };
      
      // Focus trap
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !drawer) return;
        
        const focusableElements = drawer.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (!focusableElements.length) return;
        
        const first = focusableElements[0] as HTMLElement;
        const last = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); 
          first.focus();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      drawer?.addEventListener('keydown', handleTab);
      
      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = drawer?.querySelector('a, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          document.getElementById('btn-close-nav')?.focus();
        }
      }, 100);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        drawer?.removeEventListener('keydown', handleTab);
      };
    } else {
      html.removeAttribute('data-nav-open');
      btnOpen?.setAttribute('aria-expanded', 'false');
    }
  }, [isMobileMenuOpen]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const navClass = (path: string) =>
    location === path
      ? "text-primary font-medium border-b-2 border-primary pb-1"
      : "text-[var(--on-surface-muted)] hover:text-[var(--on-surface)] transition-colors";

  return (
    <header className="backdrop-blur bg-white/70 dark:bg-black/30 border-b border-[var(--border)] sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* First Row - Brand and User Actions */}
        <div className="flex justify-between items-center h-14">
          {/* Logo and Brand */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer flex-shrink-0" data-testid="link-home">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Flame className="text-primary-foreground w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">FireSafe ITM</h1>
                <p className="text-xs text-[var(--on-surface-muted)] hidden sm:block">NFPA 25 Compliance</p>
              </div>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            id="btn-nav"
            variant="ghost"
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(true)}
            data-testid="button-mobile-menu"
            aria-controls="mobile-nav"
            aria-expanded="false"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="ghost"
              className="inline-flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              onClick={toggleTheme}
              data-testid="button-theme"
              aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              className="inline-flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              data-testid="button-notifications"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center">
                <User className="text-secondary-foreground w-4 h-4" />
              </div>
              <span 
                className="text-sm font-medium hidden lg:block"
                data-testid="text-user-name"
              >
                {(user as any)?.fullName || "Inspetor"}
              </span>
            </div>
          </div>
        </div>

        {/* Second Row - Navigation Menu */}
        <div className="hidden md:block">
          <nav className="flex items-center justify-center gap-8 pb-3 border-b border-transparent">
            {/* Primary Navigation Items - First Row */}
            <div className="flex items-center gap-6 lg:gap-8">
              <Link 
                href="/"
                className={`${navClass("/")} text-sm`}
                data-testid="nav-dashboard"
              >
                Dashboard
              </Link>
              <Link 
                href="/inspection"
                className={`${navClass("/inspection")} text-sm`}
                data-testid="nav-inspections"
              >
                Inspeções
              </Link>
              <Link 
                href="/painel-controle"
                className={`${navClass("/painel-controle")} text-sm`}
                data-testid="nav-reports"
              >
                Histórico
              </Link>
              
              {/* Companies - only show if user exists */}
              {user ? (
                <Link 
                  href="/companies"
                  className={`${navClass("/companies")} text-sm`}
                  data-testid="link-companies"
                >
                  Empresas
                </Link>
              ) : null}

              <Link 
                href="/sprinkler-module"
                className={`${navClass("/sprinkler-module")} text-sm`}
                data-testid="nav-sprinkler-module"
              >
                Sprinklers
              </Link>
              <Link 
                href="/pump-module"
                className={`${navClass("/pump-module")} text-sm`}
                data-testid="nav-pump-module"
              >
                Bombas
              </Link>
              <Link 
                href="/certificates-module"
                className={`${navClass("/certificates-module")} text-sm`}
                data-testid="nav-certificates-module"
              >
                Certificados
              </Link>
              <Link 
                href="/standpipe-module"
                className={`${navClass("/standpipe-module")} text-sm`}
                data-testid="nav-standpipe-module"
              >
                Hidrantes
              </Link>
              <Link 
                href="/settings"
                className={`${navClass("/settings")} text-sm`}
                data-testid="link-settings"
              >
                Config
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div id="mobile-nav-overlay" className={`fixed inset-0 z-[9999] md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="nav-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <nav
          id="mobile-nav"
          ref={drawerRef}
          className={`nav-drawer fixed inset-0 w-full h-full
                     bg-[var(--surface)] shadow-2xl
                     p-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)] overflow-y-auto
                     transition-all duration-300 ease-in-out will-change-transform
                     ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Flame className="text-primary-foreground w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">FireSafe ITM</h2>
                <p className="text-xs text-[var(--on-surface-muted)]">Menu de Navegação</p>
              </div>
            </div>
            <button
              id="btn-close-nav"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full
                        border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--muted)]"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Fechar menu"
              data-testid="button-close-mobile-menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-3 mb-8">
            <Link 
              href="/"
              className={`${navClass("/")} block p-4 rounded-lg text-lg font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="nav-dashboard-mobile"
            >
              Dashboard
            </Link>
            <Link 
              href="/inspection"
              className={`${navClass("/inspection")} block p-4 rounded-lg text-lg font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="nav-inspections-mobile"
            >
              Inspeções
            </Link>
            <Link 
              href="/sprinkler-module"
              className={`${navClass("/sprinkler-module")} block p-4 rounded-lg text-lg font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="nav-sprinkler-module-mobile"
            >
              Sprinklers
            </Link>
            <Link 
              href="/pump-module"
              className={`${navClass("/pump-module")} block p-4 rounded-lg text-lg font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="nav-pump-module-mobile"
            >
              Bombas
            </Link>
            <Link 
              href="/certificates-module"
              className={`${navClass("/certificates-module")} block p-4 rounded-lg text-lg font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="nav-certificates-module-mobile"
            >
              Certificados
            </Link>
            <Link 
              href="/standpipe-module"
              className={`${navClass("/standpipe-module")} block p-4 rounded-lg text-lg font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="nav-standpipe-module-mobile"
            >
              Hidrantes
            </Link>
            <Link 
              href="/painel-controle"
              className={`${navClass("/painel-controle")} block p-4 rounded-lg text-lg font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="nav-reports-mobile"
            >
              Histórico
            </Link>
            {user ? (
              <Link 
                href="/companies"
                className={`${navClass("/companies")} block p-4 rounded-lg text-lg font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-companies-mobile"
              >
                Empresas
              </Link>
            ) : null}
            <Link 
              href="/settings"
              className={`${navClass("/settings")} block p-4 rounded-lg text-lg font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="link-settings-mobile"
            >
              Config
            </Link>
          </div>

          {/* Mobile User Actions */}
          <div className="border-t border-[var(--border)] pt-4 space-y-3">
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
        </nav>
      </div>
    </header>
  );
}
