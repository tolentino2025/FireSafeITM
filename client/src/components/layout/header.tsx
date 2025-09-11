import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flame, Bell, User } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

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
                <h1 className="text-xl font-bold text-foreground">FireSafe ITM</h1>
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
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-settings"
            >
              Configurações
            </a>
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              data-testid="button-notifications"
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
    </header>
  );
}
