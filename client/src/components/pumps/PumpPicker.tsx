import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { FirePump } from "@shared/schema";

interface PumpPickerProps {
  companyId: string;
  value?: FirePump;
  onChange?: (pump: FirePump | undefined) => void;
  placeholder?: string;
}

export function PumpPicker({ 
  companyId, 
  value, 
  onChange, 
  placeholder = "Selecionar bomba..." 
}: PumpPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pumps = [], isLoading, error } = useQuery<FirePump[]>({
    queryKey: ["/api/fire-pumps/search", companyId],
    queryFn: async () => {
      const response = await fetch(`/api/fire-pumps/search?companyId=${encodeURIComponent(companyId)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch pumps: ${response.status}`);
      }
      const result = await response.json();
      // A API retorna { items: FirePump[] }, mas precisamos apenas do array
      return result.items || [];
    },
    enabled: !!companyId,
  });

  const filteredPumps = useMemo(() => {
    if (!searchQuery) return pumps;
    
    const query = searchQuery.toLowerCase();
    return pumps.filter((pump: FirePump) => 
      pump.pumpManufacturer?.toLowerCase().includes(query) ||
      pump.pumpModel?.toLowerCase().includes(query) ||
      pump.pumpSerial?.toLowerCase().includes(query) ||
      pump.siteId?.toLowerCase().includes(query)
    );
  }, [pumps, searchQuery]);

  const handleSelect = (pump: FirePump) => {
    onChange?.(value?.id === pump.id ? undefined : pump);
    setOpen(false);
  };

  const getDisplayText = (pump: FirePump) => {
    const parts = [];
    if (pump.pumpManufacturer) parts.push(pump.pumpManufacturer);
    if (pump.pumpModel) parts.push(pump.pumpModel);
    if (pump.siteId) parts.push(`(${pump.siteId})`);
    return parts.join(" ") || `Bomba #${pump.id?.substring(0, 8)}`;
  };

  const getSubText = (pump: FirePump) => {
    const details = [];
    if (pump.ratedCapacityGpm) details.push(`${pump.ratedCapacityGpm} GPM`);
    if (pump.ratedPressurePsi) details.push(`${pump.ratedPressurePsi} PSI`);
    if (pump.pumpSerial) details.push(`S/N: ${pump.pumpSerial}`);
    return details.join(" • ");
  };

  if (!companyId) {
    return (
      <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted">
        Selecione uma empresa primeiro
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between min-w-[300px]"
          data-testid="button-pump-picker"
        >
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{getDisplayText(value)}</span>
                  {getSubText(value) && (
                    <span className="text-xs text-muted-foreground">{getSubText(value)}</span>
                  )}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[400px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Buscar por fabricante, modelo, S/N ou local..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="input-pump-search"
            />
          </div>
          <CommandList>
            {isLoading && (
              <CommandEmpty>Carregando bombas...</CommandEmpty>
            )}
            {error && (
              <CommandEmpty>Erro ao carregar bombas</CommandEmpty>
            )}
            {!isLoading && !error && filteredPumps.length === 0 && (
              <CommandEmpty>
                {searchQuery ? "Nenhuma bomba encontrada" : "Nenhuma bomba cadastrada"}
              </CommandEmpty>
            )}
            {!isLoading && !error && filteredPumps.length > 0 && (
              <CommandGroup>
                {filteredPumps.map((pump: FirePump) => (
                  <CommandItem
                    key={pump.id}
                    value={pump.id}
                    onSelect={() => handleSelect(pump)}
                    className="cursor-pointer"
                    data-testid={`option-pump-${pump.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === pump.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getDisplayText(pump)}</span>
                        {pump.isActive === false && (
                          <Badge variant="secondary" className="text-xs">Inativa</Badge>
                        )}
                      </div>
                      {getSubText(pump) && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {getSubText(pump)}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}