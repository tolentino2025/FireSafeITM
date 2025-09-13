import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArchivedReport } from "@shared/schema";
import { 
  FileText, 
  Download, 
  Calendar, 
  Building, 
  Search,
  Filter,
  Archive,
  ArrowLeft,
  Plus
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "wouter";

export function ReportsHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [, setLocation] = useLocation();

  const { data: reports, isLoading } = useQuery<ArchivedReport[]>({
    queryKey: ["/api/reports/history"],
  });

  const filteredReports = reports?.filter(report => {
    const matchesSearch = searchTerm === "" || 
      report.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.formTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === "" || 
      new Date(report.inspectionDate).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesDate;
  }) || [];

  const handleDownloadReport = (reportId: string) => {
    // Criar link de download para o PDF
    const link = document.createElement('a');
    link.href = `/api/reports/${reportId}/download`;
    link.download = `relatorio-${reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando histórico de relatórios...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Archive className="w-5 h-5 mr-2 text-primary" />
            Histórico de Relatórios
          </CardTitle>
          
          <Button 
            variant="outline" 
            onClick={() => setLocation('/painel-controle')}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-reports" className="text-sm font-medium">
              Buscar Relatórios
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search-reports"
                placeholder="Digite propriedade ou tipo de formulário"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-reports"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-filter" className="text-sm font-medium">
              Filtrar por Data
            </Label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto"
                data-testid="input-date-filter"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="mb-4" style={{ color: 'var(--muted)' }}>
              {reports?.length === 0 
                ? "Nenhum relatório gerado ainda." 
                : "Nenhum relatório encontrado com os filtros aplicados."
              }
            </p>
            {reports?.length === 0 && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center gap-2"
                data-testid="button-create-first-report"
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Inspeção
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div 
                key={report.id} 
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                data-testid={`card-report-${report.id}`}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-card-foreground">
                    {report.formTitle}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {report.propertyName}
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(report.inspectionDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {report.propertyAddress && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {report.propertyAddress}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={report.status === "archived" ? "default" : "secondary"}
                    data-testid={`badge-status-${report.id}`}
                  >
                    {report.status === "archived" ? "Arquivado" : report.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport(report.id)}
                    data-testid={`button-download-${report.id}`}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Summary */}
        {reports && reports.length > 0 && (
          <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
            <p>
              Total: {reports.length} relatório{reports.length !== 1 ? 's' : ''} arquivado{reports.length !== 1 ? 's' : ''}
              {filteredReports.length !== reports.length && (
                <span> • Mostrando: {filteredReports.length}</span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}