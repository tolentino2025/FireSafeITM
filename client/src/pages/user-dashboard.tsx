import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, FileText, Calendar, Building2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
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
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#36454F] dark:text-white mb-2" data-testid="dashboard-title">
            Painel de Controle
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="dashboard-description">
            Gerencie e visualize seu histórico de relatórios NFPA 25
          </p>
        </div>

        <Card className="shadow-sm border-gray-200 dark:border-gray-700" data-testid="reports-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#36454F] dark:text-white">
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhum relatório arquivado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Seus relatórios finalizados aparecerão aqui após serem enviados e arquivados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto" data-testid="reports-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#36454F] dark:text-white">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data
                        </div>
                      </TableHead>
                      <TableHead className="text-[#36454F] dark:text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Propriedade
                        </div>
                      </TableHead>
                      <TableHead className="text-[#36454F] dark:text-white">
                        Tipo de Formulário
                      </TableHead>
                      <TableHead className="text-[#36454F] dark:text-white">
                        Status
                      </TableHead>
                      <TableHead className="text-center text-[#36454F] dark:text-white">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} data-testid={`report-row-${report.id}`}>
                        <TableCell className="font-medium">
                          <div className="text-sm">
                            {format(new Date(report.inspectionDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Arquivado: {format(new Date(report.archivedAt!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 dark:text-white truncate" data-testid={`property-name-${report.id}`}>
                              {report.propertyName}
                            </div>
                            {report.propertyAddress && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {report.propertyAddress}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" data-testid={`form-title-${report.id}`}>
                            {report.formTitle}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Arquivado
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => handleDownloadPDF(
                              report.id, 
                              `${report.formTitle.replace(/\s+/g, '_')}_${report.propertyName.replace(/\s+/g, '_')}.pdf`
                            )}
                            size="sm"
                            className="bg-[#D2042D] hover:bg-[#B30327] text-white"
                            data-testid={`download-pdf-${report.id}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        {reports && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="text-center" data-testid="total-reports-card">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#D2042D]">{reports.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Relatórios</p>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="this-month-card">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#D2042D]">
                  {reports.filter(report => {
                    const reportDate = new Date(report.inspectionDate);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Este Mês</p>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="last-report-card">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#D2042D]">
                  {reports.length > 0 ? format(new Date(reports[0].inspectionDate), 'dd/MM', { locale: ptBR }) : '--'}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Último Relatório</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}