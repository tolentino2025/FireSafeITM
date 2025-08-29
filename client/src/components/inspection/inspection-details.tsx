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

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-card-foreground border-b border-border pb-2">
        Inspection Details
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="inspectionDate" className="text-sm font-medium text-foreground">
            Inspection Date <span className="text-destructive">*</span>
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
            Inspection Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.inspectionType || ""}
            onValueChange={(value) => handleInputChange("inspectionType", value)}
          >
            <SelectTrigger className="mt-2" data-testid="select-inspection-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="special">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="nextInspectionDue" className="text-sm font-medium text-foreground">
            Next Inspection Due
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
            Inspector Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="inspectorName"
            type="text"
            value={data.inspectorName || inspector?.fullName || ""}
            onChange={(e) => handleInputChange("inspectorName", e.target.value)}
            placeholder="Full name and credentials"
            className="mt-2"
            data-testid="input-inspector-name"
          />
        </div>
        
        <div>
          <Label htmlFor="inspectorLicense" className="text-sm font-medium text-foreground">
            Inspector License #
          </Label>
          <Input
            id="inspectorLicense"
            type="text"
            value={data.inspectorLicense || inspector?.licenseNumber || ""}
            onChange={(e) => handleInputChange("inspectorLicense", e.target.value)}
            placeholder="License number"
            className="mt-2"
            data-testid="input-inspector-license"
          />
        </div>
      </div>
    </div>
  );
}
