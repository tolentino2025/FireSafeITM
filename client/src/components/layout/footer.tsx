import { Flame, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Flame className="text-primary-foreground w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">FireSafe ITM</p>
              <p className="text-xs text-muted-foreground">Gestão de Conformidade NFPA 25</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span data-testid="text-version">Versão 2.1.0</span>
            <a 
              href="#" 
              className="hover:text-foreground transition-colors flex items-center"
              data-testid="link-support"
            >
              Suporte
            </a>
            <a 
              href="#" 
              className="hover:text-foreground transition-colors flex items-center"
              data-testid="link-documentation"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Documentação
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
