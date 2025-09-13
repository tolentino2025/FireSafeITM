import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertFirePumpSchema, type InsertFirePump, type FirePump } from "@shared/schema";
import { Plus } from "lucide-react";

interface PumpRegistryModalProps {
  companyId: string;
  onCreated?: (pump: FirePump) => void;
  triggerLabel?: string;
  trigger?: React.ReactNode;
}

export function PumpRegistryModal({ 
  companyId, 
  onCreated, 
  triggerLabel = "Cadastrar Bomba",
  trigger 
}: PumpRegistryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertFirePump>({
    resolver: zodResolver(insertFirePumpSchema),
    defaultValues: {
      companyId,
      siteId: "",
      pumpManufacturer: "",
      pumpModel: "",
      pumpSerial: "",
      ratedRpm: "",
      controllerMfr: "",
      controllerModel: "",
      controllerSn: "",
      maxSuctionPressurePsi: 0,
      maxPsiShutoff: 0,
      ratedCapacityGpm: 0,
      ratedPressurePsi: 0,
      cap150Gpm: 0,
      ratedPressureAtRatedCapacityPsi: 0,
      driverMfr: "",
      driverModel: "",
      notes: "",
      isActive: true,
    },
  });

  const createPumpMutation = useMutation({
    mutationFn: async (data: InsertFirePump) => {
      const response = await apiRequest("POST", "/api/fire-pumps", data);
      return response.json() as Promise<FirePump>;
    },
    onSuccess: (newPump) => {
      // Invalidar todas as queries de bombas para garantir que apareça no picker
      queryClient.invalidateQueries({ queryKey: ["/api/fire-pumps/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fire-pumps"] });
      toast({
        title: "Bomba cadastrada com sucesso!",
        description: `${newPump.pumpManufacturer} ${newPump.pumpModel} foi adicionada.`,
      });
      onCreated?.(newPump);
      form.reset();
      setIsOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao cadastrar bomba:", error);
      toast({
        title: "Erro ao cadastrar bomba",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertFirePump) => {
    createPumpMutation.mutate(data);
  };

  const defaultTrigger = (
    <Button data-testid="button-register-pump">
      <Plus className="w-4 h-4 mr-2" />
      {triggerLabel}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Bomba de Incêndio</DialogTitle>
          <DialogDescription>
            Preencha os dados técnicos da bomba de incêndio e equipamentos auxiliares.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Identificação Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Identificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pumpManufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabricante da Bomba <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Grundfos, KSB, etc." data-testid="input-pump-manufacturer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pumpModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo da Bomba</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: CR 64-2" data-testid="input-pump-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pumpSerial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Série</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Número de série da bomba" data-testid="input-pump-serial" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local/Site ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Identificação do local" data-testid="input-site-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Especificações Técnicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Especificações Técnicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="ratedRpm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RPM Nominal</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 3500" data-testid="input-rated-rpm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ratedCapacityGpm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade Nominal (GPM)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Ex: 1500"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-rated-capacity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ratedPressurePsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Nominal (PSI)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Ex: 100"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-rated-pressure"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="maxSuctionPressurePsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Máx. Sucção (PSI)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Ex: 50"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-max-suction-pressure"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxPsiShutoff"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Máx. Shutoff (PSI)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Ex: 120"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-max-shutoff-pressure"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cap150Gpm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>150% Cap. Nominal (GPM)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Ex: 2250"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-150-capacity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ratedPressureAtRatedCapacityPsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pressão na Capacidade Nominal (PSI)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="Ex: 95"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-rated-pressure-at-capacity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Controlador */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Controlador</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="controllerMfr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabricante do Controlador</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Metron, Firetrol" data-testid="input-controller-manufacturer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="controllerModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo do Controlador</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Modelo do controlador" data-testid="input-controller-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="controllerSn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>S/N do Controlador</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Número de série" data-testid="input-controller-serial" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Driver */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Driver</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driverMfr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabricante do Driver</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Siemens, ABB" data-testid="input-driver-manufacturer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driverModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo do Driver</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Modelo do driver" data-testid="input-driver-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Observações</h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionais</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Observações técnicas, modificações, histórico de manutenção..."
                        className="min-h-[100px]"
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPumpMutation.isPending}
                data-testid="button-save-pump"
              >
                {createPumpMutation.isPending ? "Cadastrando..." : "Cadastrar Bomba"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}