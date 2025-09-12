import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Building2, Check } from "lucide-react";
import { Company } from "@shared/schema";

interface CompanyPickerProps {
  value?: Company;
  onChange: (company: Company) => void;
}

interface CompaniesSearchResponse {
  items: Company[];
  total: number;
}

function CompanyPickerDialog({ value, onChange }: CompanyPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch companies
  const { data: companiesData, isLoading } = useQuery<CompaniesSearchResponse>({
    queryKey: ["/api/companies/search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) {
        return { items: [], total: 0 };
      }
      
      const params = new URLSearchParams({
        q: debouncedSearch.trim(),
      });
      
      const response = await fetch(`/api/companies/search?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search companies: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: Boolean(debouncedSearch.trim()),
  });

  const companies = companiesData?.items || [];

  const handleSelectCompany = (company: Company) => {
    onChange(company);
    setOpen(false);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="company-picker">
          <Building2 className="h-4 w-4 mr-2" />
          Selecionar empresa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Empresa</DialogTitle>
        </DialogHeader>
        
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Busque por nome, CNPJ ou e-mail..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && searchQuery && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Buscando empresas...
              </div>
            )}
            
            {!isLoading && searchQuery && companies.length === 0 && (
              <CommandEmpty>
                Nenhuma empresa encontrada para "{searchQuery}"
              </CommandEmpty>
            )}
            
            {!searchQuery && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Digite para buscar empresas...
              </div>
            )}
            
            {companies.map((company) => {
              const isSelected = value?.id === company.id;
              const addressData = company.address as any;
              const location = addressData?.municipio && addressData?.estado 
                ? `${addressData.municipio}/${addressData.estado}`
                : '';
              
              return (
                <CommandItem
                  key={company.id}
                  value={`${company.name} ${company.cnpj || ''} ${location}`}
                  onSelect={() => handleSelectCompany(company)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{company.name}</span>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {location && (
                        <span className="truncate">{location}</span>
                      )}
                      
                      {company.cnpj && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {company.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

interface CompanyPickerInputProps {
  value?: Company;
  onChange: (company: Company) => void;
  placeholder?: string;
  disabled?: boolean;
}

function CompanyPickerInput({ value, onChange, placeholder, disabled }: CompanyPickerInputProps) {
  const addressData = value?.address as any;
  const location = addressData?.municipio && addressData?.estado 
    ? ` • ${addressData.municipio}/${addressData.estado}`
    : '';
    
  const displayValue = value 
    ? `${value.name}${location}`
    : '';

  return (
    <div className="flex gap-2">
      <Input
        value={displayValue}
        placeholder={placeholder || "Nenhuma empresa selecionada"}
        readOnly
        disabled={disabled}
        className="flex-1"
      />
      <CompanyPickerDialog value={value} onChange={onChange} />
    </div>
  );
}

export { CompanyPickerDialog, CompanyPickerInput };
export type { CompanyPickerProps, CompanyPickerInputProps };