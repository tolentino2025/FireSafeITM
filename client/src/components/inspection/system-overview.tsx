import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { InsertInspection } from "@shared/schema";
import { Droplets, Wind, Building2, Settings } from "lucide-react";

interface SystemOverviewProps {
  data: Partial<InsertInspection>;
  onChange: (updates: Partial<InsertInspection>) => void;
}

interface SystemCounts {
  wetSystems: number;
  drySystems: number;
  standpipes: number;
  firePumps: number;
}

interface EnvironmentalConditions {
  temperature: number;
  weatherConditions: string;
  windSpeed: number;
}

export function SystemOverview({ data, onChange }: SystemOverviewProps) {
  const [systemCounts, setSystemCounts] = useState<SystemCounts>({
    wetSystems: (data.systemCounts as any)?.wetSystems || 0,
    drySystems: (data.systemCounts as any)?.drySystems || 0,
    standpipes: (data.systemCounts as any)?.standpipes || 0,
    firePumps: (data.systemCounts as any)?.firePumps || 0,
  });

  const [envConditions, setEnvConditions] = useState<EnvironmentalConditions>({
    temperature: (data.environmentalConditions as any)?.temperature || 72,
    weatherConditions: (data.environmentalConditions as any)?.weatherConditions || "",
    windSpeed: (data.environmentalConditions as any)?.windSpeed || 0,
  });

  const handleSystemCountChange = (field: keyof SystemCounts, value: number) => {
    const newCounts = { ...systemCounts, [field]: value };
    setSystemCounts(newCounts);
    onChange({ systemCounts: newCounts });
  };

  const handleEnvChange = (field: keyof EnvironmentalConditions, value: any) => {
    const newConditions = { ...envConditions, [field]: value };
    setEnvConditions(newConditions);
    onChange({ environmentalConditions: newConditions });
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-card-foreground border-b border-border pb-2">
        System Overview
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border rounded-lg p-4 bg-accent/50">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-accent-foreground">Wet Systems</h5>
            <Droplets className="w-4 h-4 text-primary" />
          </div>
          <Input
            type="number"
            value={systemCounts.wetSystems}
            onChange={(e) => handleSystemCountChange("wetSystems", parseInt(e.target.value) || 0)}
            className="text-2xl font-bold border-none p-0 h-8 bg-transparent"
            data-testid="input-wet-systems"
          />
          <p className="text-sm text-muted-foreground">Active systems</p>
        </div>
        
        <div className="border border-border rounded-lg p-4 bg-accent/50">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-accent-foreground">Dry Systems</h5>
            <Wind className="w-4 h-4 text-primary" />
          </div>
          <Input
            type="number"
            value={systemCounts.drySystems}
            onChange={(e) => handleSystemCountChange("drySystems", parseInt(e.target.value) || 0)}
            className="text-2xl font-bold border-none p-0 h-8 bg-transparent"
            data-testid="input-dry-systems"
          />
          <p className="text-sm text-muted-foreground">Active systems</p>
        </div>
        
        <div className="border border-border rounded-lg p-4 bg-accent/50">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-accent-foreground">Standpipes</h5>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <Input
            type="number"
            value={systemCounts.standpipes}
            onChange={(e) => handleSystemCountChange("standpipes", parseInt(e.target.value) || 0)}
            className="text-2xl font-bold border-none p-0 h-8 bg-transparent"
            data-testid="input-standpipes"
          />
          <p className="text-sm text-muted-foreground">Systems installed</p>
        </div>
        
        <div className="border border-border rounded-lg p-4 bg-accent/50">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-accent-foreground">Fire Pumps</h5>
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <Input
            type="number"
            value={systemCounts.firePumps}
            onChange={(e) => handleSystemCountChange("firePumps", parseInt(e.target.value) || 0)}
            className="text-2xl font-bold border-none p-0 h-8 bg-transparent"
            data-testid="input-fire-pumps"
          />
          <p className="text-sm text-muted-foreground">Electric pump</p>
        </div>
      </div>

      <div>
        <Label htmlFor="additionalNotes" className="text-sm font-medium text-foreground">
          Additional Notes
        </Label>
        <Textarea
          id="additionalNotes"
          rows={4}
          value={data.additionalNotes || ""}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
          placeholder="Any special conditions, recent modifications, or relevant observations"
          className="mt-2 resize-none"
          data-testid="textarea-additional-notes"
        />
      </div>

      {/* Environmental Conditions */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-card-foreground border-b border-border pb-2">
          Environmental Conditions
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="temperature" className="text-sm font-medium text-foreground">
              Temperature (°F)
            </Label>
            <Input
              id="temperature"
              type="number"
              value={envConditions.temperature}
              onChange={(e) => handleEnvChange("temperature", parseInt(e.target.value) || 0)}
              placeholder="Current temperature"
              className="mt-2"
              data-testid="input-temperature"
            />
          </div>
          
          <div>
            <Label htmlFor="weatherConditions" className="text-sm font-medium text-foreground">
              Weather Conditions
            </Label>
            <Select
              value={envConditions.weatherConditions}
              onValueChange={(value) => handleEnvChange("weatherConditions", value)}
            >
              <SelectTrigger className="mt-2" data-testid="select-weather">
                <SelectValue placeholder="Select conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="cloudy">Cloudy</SelectItem>
                <SelectItem value="rain">Rain</SelectItem>
                <SelectItem value="snow">Snow</SelectItem>
                <SelectItem value="extreme">Extreme Weather</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="windSpeed" className="text-sm font-medium text-foreground">
              Wind Speed (mph)
            </Label>
            <Input
              id="windSpeed"
              type="number"
              value={envConditions.windSpeed}
              onChange={(e) => handleEnvChange("windSpeed", parseInt(e.target.value) || 0)}
              placeholder="Wind speed"
              className="mt-2"
              data-testid="input-wind-speed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
