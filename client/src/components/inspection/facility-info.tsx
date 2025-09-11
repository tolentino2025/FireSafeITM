import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InsertInspection } from "@shared/schema";

interface FacilityInfoProps {
  data: Partial<InsertInspection>;
  onChange: (updates: Partial<InsertInspection>) => void;
}

export function FacilityInfo({ data, onChange }: FacilityInfoProps) {
  const handleInputChange = (field: keyof InsertInspection, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-card-foreground border-b border-border pb-2">
        Informações da Propriedade
      </h4>
      
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
