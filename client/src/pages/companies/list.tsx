import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useSearch } from "wouter";
import { Company } from "@shared/schema";
import { Plus, Search, Pencil, Trash2, Building2, ChevronLeft, ChevronRight } from "lucide-react";

interface CompaniesResponse {
  items: Company[];
  total: number;
}

function CompaniesListPage() {
  const [, setLocation] = useLocation();
  const queryString = useSearch();
  const { toast } = useToast();
  
  // Parse query parameters from URL
  const searchParams = new URLSearchParams(queryString);
  const qFromUrl = searchParams.get("q") || "";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(qFromUrl);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const pageSize = 20;

  // Sync URL with query parameters
  const updateUrl = (q: string, page: number) => {
    const params = new URLSearchParams();
    if (q.trim()) {
      params.set("q", q.trim());
    }
    if (page > 1) {
      params.set("page", page.toString());
    }
    
    const newUrl = `/companies${params.toString() ? `?${params.toString()}` : ""}`;
    setLocation(newUrl);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      const newPage = searchQuery !== debouncedSearch ? 1 : currentPage;
      setCurrentPage(newPage);
      updateUrl(searchQuery, newPage);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when page changes
  useEffect(() => {
    updateUrl(debouncedSearch, currentPage);
  }, [currentPage]);

  // Fetch companies
  const { data: companiesData, isLoading } = useQuery<CompaniesResponse>({
    queryKey: ["/api/companies", { q: debouncedSearch, page: currentPage }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (debouncedSearch.trim()) {
        params.append("q", debouncedSearch.trim());
      }
      
      const response = await fetch(`/api/companies?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const response = await apiRequest("DELETE", `/api/companies/${companyId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Empresa excluída",
        description: "A empresa foi excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "";
      const errorData = error.data || {};
      
      if (errorMessage.includes("409") || errorMessage.includes("Conflict") || errorData.error === "COMPANY_HAS_INSPECTIONS") {
        toast({
          variant: "destructive",
          title: "Erro ao excluir empresa",
          description: "Não é possível excluir: existem inspeções vinculadas a esta empresa.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao excluir empresa",
          description: "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    },
  });

  const handleDeleteCompany = (companyId: string) => {
    deleteCompanyMutation.mutate(companyId);
  };

  const companies = companiesData?.items || [];
  const totalCompanies = companiesData?.total || 0;
  const totalPages = Math.ceil(totalCompanies / pageSize);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">Empresas</h1>
        </div>
        
        <Link href="/companies/new">
          <Button data-testid="company-new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova empresa
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="company-search"
              placeholder="Buscar por nome, CNPJ ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results summary */}
      {!isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {debouncedSearch 
              ? `${totalCompanies} resultado(s) encontrado(s) para "${debouncedSearch}"`
              : `${totalCompanies} empresa(s) cadastrada(s)`
            }
          </span>
          {totalPages > 1 && (
            <span>
              Página {currentPage} de {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Companies Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent>
            <div className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                {debouncedSearch 
                  ? `Não foram encontradas empresas para "${debouncedSearch}"`
                  : "Você ainda não cadastrou nenhuma empresa"
                }
              </p>
              {!debouncedSearch && (
                <Link href="/companies/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar primeira empresa
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium">
                      {company.name}
                    </CardTitle>
                    {company.cnpj && (
                      <Badge variant="outline" className="font-mono text-xs w-fit">
                        {company.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.companyEmail && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">E-mail: </span>
                        <span className="text-foreground">{company.companyEmail}</span>
                      </div>
                    )}
                    
                    {company.phone && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Telefone: </span>
                        <span className="text-foreground">{company.phone}</span>
                      </div>
                    )}
                    
                    {company.address && typeof company.address === 'object' && 
                     (company.address as any)?.municipio && (company.address as any)?.estado && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Localização: </span>
                        <span className="text-foreground">
                          {`${(company.address as any).municipio}/${(company.address as any).estado}`}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <Link href={`/companies/${company.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir empresa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a empresa "{company.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCompany(company.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deleteCompanyMutation.isPending}
                            >
                              {deleteCompanyMutation.isPending ? "Excluindo..." : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export { CompaniesListPage };