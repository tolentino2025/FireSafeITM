import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompanyPickerInput } from "@/components/companies/CompanyPicker";
import { InsertInspection, Company } from "@shared/schema";
import { Building2, AlertTriangle, Edit } from "lucide-react";

interface FacilityInfoProps {
  data: Partial<InsertInspection>;
  onChange: (updates: Partial<InsertInspection>) => void;
  selectedCompany?: Company;
  onCompanyChange: (company: Company) => void;
  isEditing?: boolean;
  canChangeCompany?: boolean;
  companyError?: string;
}

export function FacilityInfo({ data, onChange, selectedCompany, onCompanyChange, isEditing = false, canChangeCompany = true, companyError }: FacilityInfoProps) {
  const handleInputChange = (field: keyof InsertInspection, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-card-foreground border-b border-border pb-2">
        Informações da Propriedade
      </h4>
      
      {/* Company Selection/Display */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-foreground">
          Empresa <span className="text-destructive">*</span>
        </Label>
        
        {isEditing && selectedCompany && !canChangeCompany ? (
          // Show company card in read-only mode
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4" />
                {selectedCompany.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedCompany.cnpj && (
                  <div>
                    <span className="text-muted-foreground">CNPJ:</span>
                    <Badge variant="outline" className="ml-2 font-mono text-xs">
                      {selectedCompany.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}
                    </Badge>
                  </div>
                )}
                {selectedCompany.address && (selectedCompany.address as any).municipio && (
                  <div>
                    <span className="text-muted-foreground">Localização:</span>
                    <span className="ml-2">
                      {(selectedCompany.address as any).municipio}/{(selectedCompany.address as any).estado}
                    </span>
                  </div>
                )}
                {selectedCompany.companyEmail && (
                  <div>
                    <span className="text-muted-foreground">E-mail:</span>
                    <span className="ml-2">{selectedCompany.companyEmail}</span>
                  </div>
                )}
                {selectedCompany.phone && (
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="ml-2">{selectedCompany.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Show company picker
          <div className="space-y-2">
            <CompanyPickerInput
              value={selectedCompany}
              onChange={onCompanyChange}
              placeholder="Selecione a empresa responsável"
              disabled={isEditing && !canChangeCompany}
            />
            {canChangeCompany && isEditing && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Edit className="h-3 w-3" />
                Você pode alterar a empresa apenas se o status da inspeção permitir
              </p>
            )}
          </div>
        )}
        
        {companyError && (
          <Alert variant="destructive" data-testid="inspection-company-required-error">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {companyError}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="facilityName" className="text-sm font-medium text-foreground">
            Nome da Propriedade <span className="text-destructive">*</span>
          </Label>
          <Input
            id="facilityName"
            type="text"
            value={data.facilityName || ""}
            onChange={(e) => handleInputChange("facilityName", e.target.value)}
            placeholder="Digite o nome da propriedade"
            className="mt-2"
            data-testid="input-facility-name"
          />
        </div>
        
        <div>
          <Label htmlFor="facilityId" className="text-sm font-medium text-foreground">
            ID da Propriedade
          </Label>
          <Input
            id="facilityId"
            type="text"
            value={data.facilityId || ""}
            onChange={(e) => handleInputChange("facilityId", e.target.value)}
            placeholder="Número de identificação da propriedade"
            className="mt-2"
            data-testid="input-facility-id"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="address" className="text-sm font-medium text-foreground">
            Endereço <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="address"
            rows={3}
            value={data.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Endereço completo da propriedade"
            className="mt-2 resize-none"
            data-testid="textarea-address"
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="buildingType" className="text-sm font-medium text-foreground">
              Tipo de Edificação
            </Label>
            <Select
              value={data.buildingType || ""}
              onValueChange={(value) => handleInputChange("buildingType", value)}
            >
              <SelectTrigger className="mt-2" data-testid="select-building-type">
                <SelectValue placeholder="Selecione o tipo de edificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Edifício Comercial</SelectItem>
                <SelectItem value="retail">Varejo/Comércio</SelectItem>
                <SelectItem value="warehouse">Armazém/Galpão</SelectItem>
                <SelectItem value="manufacturing">Industrial/Manufatura</SelectItem>
                <SelectItem value="healthcare">Saúde/Hospitalar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="totalFloorArea" className="text-sm font-medium text-foreground">
              Área Total do Piso (ft²)
            </Label>
            <Input
              id="totalFloorArea"
              type="number"
              value={data.totalFloorArea || ""}
              onChange={(e) => handleInputChange("totalFloorArea", parseInt(e.target.value) || undefined)}
              placeholder="Metragem em pés quadrados"
              className="mt-2"
              data-testid="input-floor-area"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
