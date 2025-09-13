import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, FileText, Calendar, Building2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArchivedReport } from "@shared/schema";
import { useLocation } from "wouter";

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const { data: reports, isLoading, error } = useQuery<ArchivedReport[]>({
    queryKey: ['/api/archived-reports'],
  });

  const handleDownloadPDF = (reportId: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `/api/archived-reports/${reportId}/pdf`;
    link.download = fileName;
    link.click();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-bg dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar relatórios arquivados. Tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-gray-900" data-testid="dashboard-page">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight dark:text-white mb-2" data-testid="dashboard-title" style={{ color: 'var(--text)' }}>
            Painel de Controle
          </h1>
          <p className="text-muted dark:text-gray-400" data-testid="dashboard-description">
            Gerencie e visualize seu histórico de relatórios NFPA 25
          </p>
        </div>

        <Card className="shadow-sm border-border dark:border-gray-700" data-testid="reports-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 dark:text-white" style={{ color: 'var(--text)' }}>
                <FileText className="h-5 w-5" />
                Histórico de Relatórios
              </CardTitle>
              
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : !reports || reports.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-reports">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text dark:text-white mb-2">
                  Nenhum relatório arquivado
                </h3>
                <p className="text-muted dark:text-gray-400">
                  Seus relatórios finalizados aparecerão aqui após serem enviados e arquivados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="reports-grid">
                {reports.map((report) => (
                  <Card key={report.id} data-testid={`report-card-${report.id}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate" data-testid={`property-name-${report.id}`}>
                          {report.propertyName}
                        </span>
                      </CardTitle>
                      {report.propertyAddress && (
                        <div className="text-sm text-muted dark:text-gray-400 truncate">
                          {report.propertyAddress}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(report.inspectionDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="text-xs text-muted dark:text-gray-400">
                            Arquivado: {format(new Date(report.archivedAt!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" data-testid={`form-title-${report.id}`}>
                          {report.formTitle}
                        </span>
                        
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2">
                          Arquivado
                        </span>
                      </div>
                      
                      <div className="pt-2 border-t border-border">
                        <Button
                          onClick={() => handleDownloadPDF(
                            report.id, 
                            `${report.formTitle.replace(/\s+/g, '_')}_${report.propertyName.replace(/\s+/g, '_')}.pdf`
                          )}
                          size="sm"
                          className="w-full text-white"
                          style={{ backgroundColor: 'var(--danger)' }}
                          data-testid={`download-pdf-${report.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        {reports && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="text-center" data-testid="total-reports-card">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>{reports.length}</div>
                <p className="text-sm text-muted dark:text-gray-400">Total de Relatórios</p>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="this-month-card">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>
                  {reports.filter(report => {
                    const reportDate = new Date(report.inspectionDate);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <p className="text-sm text-muted dark:text-gray-400">Este Mês</p>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="last-report-card">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>
                  {reports.length > 0 ? format(new Date(reports[0].inspectionDate), 'dd/MM', { locale: ptBR }) : '--'}
                </div>
                <p className="text-sm text-muted dark:text-gray-400">Último Relatório</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}