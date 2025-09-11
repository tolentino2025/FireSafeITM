import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InsertInspection, User } from "@shared/schema";

interface InspectionDetailsProps {
  data: Partial<InsertInspection>;
  onChange: (updates: Partial<InsertInspection>) => void;
  inspector?: User;
}

export function InspectionDetails({ data, onChange, inspector }: InspectionDetailsProps) {
  const handleInputChange = (field: keyof InsertInspection, value: any) => {
    onChange({ [field]: value });
  };

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-card-foreground border-b border-border pb-2">
        Detalhes da Inspeção
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="inspectionDate" className="text-sm font-medium text-foreground">
            Data da Inspeção <span className="text-destructive">*</span>
          </Label>
          <Input
            id="inspectionDate"
            type="date"
            value={formatDateForInput(data.inspectionDate)}
            onChange={(e) => handleInputChange("inspectionDate", new Date(e.target.value))}
            className="mt-2"
            data-testid="input-inspection-date"
          />
        </div>
        
        <div>
          <Label htmlFor="inspectionType" className="text-sm font-medium text-foreground">
            Tipo de Inspeção <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.inspectionType || ""}
            onValueChange={(value) => handleInputChange("inspectionType", value)}
          >
            <SelectTrigger className="mt-2" data-testid="select-inspection-type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
              <SelectItem value="special">Especial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="nextInspectionDue" className="text-sm font-medium text-foreground">
            Próxima Inspeção Programada
          </Label>
          <Input
            id="nextInspectionDue"
            type="date"
            value={formatDateForInput(data.nextInspectionDue)}
            onChange={(e) => handleInputChange("nextInspectionDue", new Date(e.target.value))}
            className="mt-2"
            data-testid="input-next-inspection"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="inspectorName" className="text-sm font-medium text-foreground">
            Nome do Inspetor <span className="text-destructive">*</span>
          </Label>
          <Input
            id="inspectorName"
            type="text"
            value={data.inspectorName || inspector?.fullName || ""}
            onChange={(e) => handleInputChange("inspectorName", e.target.value)}
            placeholder="Nome completo e credenciais"
            className="mt-2"
            data-testid="input-inspector-name"
          />
        </div>
        
        <div>
          <Label htmlFor="inspectorLicense" className="text-sm font-medium text-foreground">
            Licença do Inspetor Nº
          </Label>
          <Input
            id="inspectorLicense"
            type="text"
            value={data.inspectorLicense || inspector?.licenseNumber || ""}
            onChange={(e) => handleInputChange("inspectorLicense", e.target.value)}
            placeholder="Número da licença"
            className="mt-2"
            data-testid="input-inspector-license"
          />
        </div>
      </div>
    </div>
  );
}
