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
        Facility Information
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="facilityName" className="text-sm font-medium text-foreground">
            Facility Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="facilityName"
            type="text"
            value={data.facilityName || ""}
            onChange={(e) => handleInputChange("facilityName", e.target.value)}
            placeholder="Enter facility name"
            className="mt-2"
            data-testid="input-facility-name"
          />
        </div>
        
        <div>
          <Label htmlFor="facilityId" className="text-sm font-medium text-foreground">
            Facility ID
          </Label>
          <Input
            id="facilityId"
            type="text"
            value={data.facilityId || ""}
            onChange={(e) => handleInputChange("facilityId", e.target.value)}
            placeholder="Facility identification number"
            className="mt-2"
            data-testid="input-facility-id"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="address" className="text-sm font-medium text-foreground">
            Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="address"
            rows={3}
            value={data.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Complete facility address"
            className="mt-2 resize-none"
            data-testid="textarea-address"
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="buildingType" className="text-sm font-medium text-foreground">
              Building Type
            </Label>
            <Select
              value={data.buildingType || ""}
              onValueChange={(value) => handleInputChange("buildingType", value)}
            >
              <SelectTrigger className="mt-2" data-testid="select-building-type">
                <SelectValue placeholder="Select building type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Office Building</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="totalFloorArea" className="text-sm font-medium text-foreground">
              Total Floor Area (sq ft)
            </Label>
            <Input
              id="totalFloorArea"
              type="number"
              value={data.totalFloorArea || ""}
              onChange={(e) => handleInputChange("totalFloorArea", parseInt(e.target.value) || undefined)}
              placeholder="Square footage"
              className="mt-2"
              data-testid="input-floor-area"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
