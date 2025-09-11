import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  Droplets, 
  Building2, 
  Settings, 
  Gauge, 
  ClipboardCheck,
  ExternalLink,
  Check
} from "lucide-react";

type FormSection = "general" | "sprinkler" | "standpipe" | "pump" | "valves" | "final";

interface SidebarNavProps {
  currentSection: FormSection;
  onSectionChange: (section: FormSection) => void;
  progress?: number;
}

const SECTIONS = [
  { id: "general", name: "Informações Gerais", icon: Info },
  { id: "sprinkler", name: "Sistemas de Sprinklers", icon: Droplets },
  { id: "standpipe", name: "Sistemas de Coluna Seca", icon: Building2 },
  { id: "pump", name: "Testes de Bomba", icon: Settings },
  { id: "valves", name: "Válvulas de Controle", icon: Gauge },
  { id: "final", name: "Inspeção Final", icon: ClipboardCheck },
] as const;

export function SidebarNav({ currentSection, onSectionChange, progress = 0 }: SidebarNavProps) {
  const completedSections = Math.floor((progress / 100) * SECTIONS.length);
  
  return (
    <div className="space-y-6">
      <Card className="sticky top-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Seções do Formulário
          </h3>
          <nav className="space-y-2">
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              const isActive = currentSection === section.id;
              const isCompleted = index < completedSections;
              
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id as FormSection)}
                  className={`flex items-center w-full p-3 rounded-md transition-colors text-left ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                  data-testid={`nav-section-${section.id}`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className={isActive ? "font-medium" : ""}>
                    {section.name}
                  </span>
                  {isCompleted && !isActive && (
                    <Check className="w-4 h-4 ml-auto text-primary" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-4 bg-accent rounded-lg">
            <h4 className="font-semibold text-accent-foreground mb-2">
              Referência Rápida
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Requisitos da Norma NFPA 25 e frequências de testes.
            </p>
            <Button 
              variant="link" 
              className="text-sm text-primary hover:text-primary/80 font-medium p-0 h-auto"
              data-testid="button-view-guidelines"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Ver Diretrizes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
