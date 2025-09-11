import { Card, CardContent } from "@/components/ui/card";

interface FormProgressProps {
  currentSection: string;
  progress: number;
}

export function FormProgress({ currentSection, progress }: FormProgressProps) {
  const sections = [
    { id: "general", name: "Informações Gerais" },
    { id: "sprinkler", name: "Sistema de Sprinklers" },
    { id: "standpipe", name: "Coluna Seca" },
    { id: "pump", name: "Teste de Bombas" },
    { id: "valves", name: "Válvulas de Controle" },
    { id: "final", name: "Inspeção Final" },
  ];

  const completedSections = Math.floor((progress / 100) * sections.length);

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Progresso da Inspeção
          </h3>
          <span className="text-sm text-muted-foreground" data-testid="text-progress">
            {completedSections} de {sections.length} seções concluídas
          </span>
        </div>
        <div className="flex space-x-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`flex-1 h-2 rounded-full ${
                index < completedSections 
                  ? "bg-primary" 
                  : "bg-muted"
              }`}
              data-testid={`progress-bar-${section.id}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          {sections.map((section) => (
            <span key={section.id} data-testid={`progress-label-${section.id}`}>
              {section.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
