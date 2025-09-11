import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Inspection } from "@shared/schema";
import { Link } from "wouter";
import { 
  FileText, 
  Edit, 
  Trash2, 
  Calendar, 
  Building, 
  Search,
  Clock,
  Save
} from "lucide-react";
import React, { useState } from "react";

export function SavedForms() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: draftInspections, isLoading } = useQuery<Inspection[]>({
    queryKey: ["/api/inspections/drafts"],
  });

  const deleteInspectionMutation = useMutation({
    mutationFn: async (inspectionId: string) => {
      const response = await fetch(`/api/inspections/${inspectionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error('Falha ao excluir inspeção');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inspections/drafts"] });
      toast({
        title: "Formulário Excluído",
        description: "O rascunho foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o formulário. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao excluir inspeção:", error);
    },
  });

  const filteredInspections = draftInspections?.filter(inspection => {
    return searchTerm === "" || 
      inspection.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspectionType.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleDeleteDraft = (inspectionId: string, facilityName: string) => {
    if (confirm(`Tem certeza que deseja excluir o rascunho "${facilityName}"? Esta ação não pode ser desfeita.`)) {
      deleteInspectionMutation.mutate(inspectionId);
    }
  };

  const getFormRoute = (inspection: Inspection): string => {
    // Mapear tipos de inspeção para suas rotas de formulário correspondentes
    const routeMap: Record<string, string> = {
      "wet-sprinkler": "/wet-sprinkler-form",
      "dry-sprinkler": "/dry-sprinkler-form",
      "water-spray": "/water-spray-form",
      "foam-water": "/foam-water-form",
      "preaction-deluge": "/preaction-deluge-form",
      "standpipe-hose": "/standpipe-hose-form",
      "hydrant-flow": "/hydrant-flow-test-form",
      "weekly-pump": "/weekly-pump-form",
      "monthly-pump": "/monthly-pump-form",
      "annual-pump": "/annual-pump-form",
      "fire-service-mains": "/fire-service-mains-form"
    };
    
    return routeMap[inspection.inspectionType] || `/inspection/${inspection.id}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "text-green-600";
    if (progress >= 50) return "text-yellow-600";
    if (progress >= 25) return "text-orange-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando formulários salvos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="w-5 h-5 mr-2 text-primary" />
          Formulários Salvos
        </CardTitle>
        
        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por propriedade ou tipo de inspeção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-forms"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredInspections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              {draftInspections?.length === 0 
                ? "Nenhum formulário salvo ainda." 
                : "Nenhum formulário encontrado com o termo de busca."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map((inspection) => (
              <div 
                key={inspection.id} 
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                data-testid={`card-draft-${inspection.id}`}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-card-foreground">
                    {inspection.facilityName}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      {inspection.inspectionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(inspection.inspectionDate).toLocaleDateString('pt-BR')}
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Atualizado em {new Date(inspection.updatedAt || inspection.createdAt || '').toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {inspection.address && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <Building className="w-3 h-3 inline mr-1" />
                      {inspection.address}
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso:</span>
                      <span className={`font-medium ${getProgressColor(inspection.progress)}`}>
                        {inspection.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${inspection.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  <Badge 
                    variant="secondary"
                    data-testid={`badge-status-${inspection.id}`}
                  >
                    Rascunho
                  </Badge>
                  <Link href={getFormRoute(inspection)}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-continue-${inspection.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Continuar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteDraft(inspection.id, inspection.facilityName)}
                    disabled={deleteInspectionMutation.isPending}
                    data-testid={`button-delete-${inspection.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-1 text-destructive" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Summary */}
        {draftInspections && draftInspections.length > 0 && (
          <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
            <p>
              Total: {draftInspections.length} formulário{draftInspections.length !== 1 ? 's' : ''} salvo{draftInspections.length !== 1 ? 's' : ''}
              {filteredInspections.length !== draftInspections.length && (
                <span> • Mostrando: {filteredInspections.length}</span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}