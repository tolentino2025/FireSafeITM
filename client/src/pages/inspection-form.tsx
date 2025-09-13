import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FormProgress } from "@/components/inspection/form-progress";
import { SidebarNav } from "@/components/inspection/sidebar-nav";
import { FacilityInfo } from "@/components/inspection/facility-info";
import { InspectionDetails } from "@/components/inspection/inspection-details";
import { SystemOverview } from "@/components/inspection/system-overview";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Inspection, InsertInspection, Company } from "@shared/schema";
import { Save, Check, ExternalLink, Clock, AlertTriangle } from "lucide-react";

type FormSection = "general" | "sprinkler" | "standpipe" | "pump" | "valves" | "final";

const SECTION_TITLES = {
  general: "General Information",
  sprinkler: "Sprinkler Systems", 
  standpipe: "Standpipe Systems",
  pump: "Pump Testing",
  valves: "Control Valves",
  final: "Final Inspection"
};

export default function InspectionForm() {
  const [, params] = useRoute("/inspection/:id?");
  const [location, setLocation] = useLocation();
  const inspectionId = params?.id;
  const [currentSection, setCurrentSection] = useState<FormSection>("general");
  const [formData, setFormData] = useState<Partial<InsertInspection>>({});
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [companyError, setCompanyError] = useState<string>("");
  const { toast } = useToast();

  const { data: inspection, isLoading } = useQuery<Inspection>({
    queryKey: ["/api/inspections", inspectionId],
    enabled: !!inspectionId,
  });

  // Load company data when editing an inspection
  useEffect(() => {
    if (inspection && inspection.companyId && !selectedCompany) {
      // If inspection has a company, fetch it (it should be included in the inspection data with JOIN)
      if ((inspection as any).company) {
        setSelectedCompany((inspection as any).company);
      }
    }
  }, [inspection, selectedCompany]);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertInspection) => {
      const response = await apiRequest("POST", "/api/inspections", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      toast({
        title: "Success",
        description: "Inspection created successfully",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Inspection> }) => {
      const response = await apiRequest("PATCH", `/api/inspections/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      toast({
        title: "Success", 
        description: "Inspection updated successfully",
      });
    },
  });

  const handleFormUpdate = (updates: Partial<InsertInspection>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleCompanyChange = (company: Company) => {
    setSelectedCompany(company);
    setCompanyError(""); // Clear error when company is selected
    setFormData(prev => ({ ...prev, companyId: company.id }));
  };

  const validateForm = () => {
    // Clear previous errors
    setCompanyError("");
    
    // Validate company selection
    if (!selectedCompany || !formData.companyId) {
      setCompanyError("Selecione uma empresa");
      return false;
    }
    
    return true;
  };

  const handleSaveDraft = () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Corrija os erros antes de continuar.",
      });
      return;
    }

    const inspectionData: InsertInspection = {
      facilityName: formData.facilityName || "",
      address: formData.address || "",
      inspectionDate: formData.inspectionDate || new Date(),
      inspectionType: formData.inspectionType || "weekly",
      inspectorId: (user as any)?.id || "default-user-id",
      inspectorName: formData.inspectorName || (user as any)?.fullName || "",
      companyId: selectedCompany!.id, // Use selectedCompany.id
      status: "draft",
      progress: calculateProgress(),
      ...formData,
    };

    if (inspectionId) {
      updateMutation.mutate({ id: inspectionId, data: inspectionData });
    } else {
      createMutation.mutate(inspectionData);
    }
  };

  const handleContinueToSprinkler = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Corrija os erros antes de continuar.",
      });
      return;
    }

    // Save current section data first
    const inspectionData: InsertInspection = {
      facilityName: formData.facilityName || "",
      address: formData.address || "",
      inspectionDate: formData.inspectionDate || new Date(),
      inspectionType: formData.inspectionType || "weekly",
      inspectorId: (user as any)?.id || "default-user-id",
      inspectorName: formData.inspectorName || (user as any)?.fullName || "",
      companyId: selectedCompany!.id, // Use selectedCompany.id
      status: "draft",
      progress: calculateProgress(),
      ...formData,
    };

    try {
      if (inspectionId) {
        await updateMutation.mutateAsync({ id: inspectionId, data: inspectionData });
      } else {
        const newInspection = await createMutation.mutateAsync(inspectionData);
        // Navigate to sprinkler module with the new inspection ID
        setLocation(`/sprinkler-module?inspectionId=${(newInspection as any).id}`);
        return;
      }
      
      // Navigate to sprinkler module with existing inspection ID
      setLocation(`/sprinkler-module?inspectionId=${inspectionId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContinueToStandpipe = async () => {
    // Save current section data first and mark sprinkler section as completed
    const inspectionData: InsertInspection = {
      facilityName: formData.facilityName || "",
      address: formData.address || "",
      inspectionDate: formData.inspectionDate || new Date(),
      inspectionType: formData.inspectionType || "weekly",
      inspectorId: (user as any)?.id || "default-user-id",
      inspectorName: formData.inspectorName || (user as any)?.fullName || "",
      status: "draft",
      progress: calculateProgress(),
      ...formData,
    };

    try {
      if (inspectionId) {
        await updateMutation.mutateAsync({ id: inspectionId, data: inspectionData });
        // Navigate to standpipe module with inspection ID
        setLocation(`/standpipe-module?inspectionId=${inspectionId}`);
      } else {
        const newInspection = await createMutation.mutateAsync(inspectionData);
        // Navigate to standpipe module with the new inspection ID
        setLocation(`/standpipe-module?inspectionId=${(newInspection as any).id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContinueToPumpTesting = async () => {
    // Save current section data first and mark standpipe section as completed
    const inspectionData: InsertInspection = {
      facilityName: formData.facilityName || "",
      address: formData.address || "",
      inspectionDate: formData.inspectionDate || new Date(),
      inspectionType: formData.inspectionType || "weekly",
      inspectorId: (user as any)?.id || "default-user-id",
      inspectorName: formData.inspectorName || (user as any)?.fullName || "",
      status: "draft",
      progress: calculateProgress(),
      ...formData,
    };

    try {
      if (inspectionId) {
        await updateMutation.mutateAsync({ id: inspectionId, data: inspectionData });
        // Navigate to pump testing with inspection ID
        setLocation(`/pump-module?inspectionId=${inspectionId}`);
      } else {
        const newInspection = await createMutation.mutateAsync(inspectionData);
        // Navigate to pump testing with the new inspection ID
        setLocation(`/pump-module?inspectionId=${(newInspection as any).id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContinueToControlValves = async () => {
    // Save current section data first and mark pump section as completed
    const inspectionData: InsertInspection = {
      facilityName: formData.facilityName || "",
      address: formData.address || "",
      inspectionDate: formData.inspectionDate || new Date(),
      inspectionType: formData.inspectionType || "weekly",
      inspectorId: (user as any)?.id || "default-user-id",
      inspectorName: formData.inspectorName || (user as any)?.fullName || "",
      status: "draft",
      progress: calculateProgress(),
      ...formData,
    };

    try {
      if (inspectionId) {
        await updateMutation.mutateAsync({ id: inspectionId, data: inspectionData });
        // Navigate to control valves with inspection ID
        setLocation(`/inspection/${inspectionId}`);
      } else {
        const newInspection = await createMutation.mutateAsync(inspectionData);
        // Navigate to control valves with the new inspection ID
        setLocation(`/inspection/${(newInspection as any).id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContinueToFinalInspection = async () => {
    // Save current section data first and mark valves section as completed
    const inspectionData: InsertInspection = {
      facilityName: formData.facilityName || "",
      address: formData.address || "",
      inspectionDate: formData.inspectionDate || new Date(),
      inspectionType: formData.inspectionType || "weekly",
      inspectorId: (user as any)?.id || "default-user-id",
      inspectorName: formData.inspectorName || (user as any)?.fullName || "",
      status: "draft",
      progress: calculateProgress(),
      ...formData,
    };

    try {
      if (inspectionId) {
        await updateMutation.mutateAsync({ id: inspectionId, data: inspectionData });
        // Navigate to final inspection with inspection ID
        setLocation(`/inspection/${inspectionId}`);
      } else {
        const newInspection = await createMutation.mutateAsync(inspectionData);
        // Navigate to final inspection with the new inspection ID
        setLocation(`/inspection/${(newInspection as any).id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitFinalInspection = async () => {
    // Mark all sections as completed and submit inspection
    const inspectionData: InsertInspection = {
      facilityName: formData.facilityName || "",
      address: formData.address || "",
      inspectionDate: formData.inspectionDate || new Date(),
      inspectionType: formData.inspectionType || "weekly",
      inspectorId: (user as any)?.id || "default-user-id",
      inspectorName: formData.inspectorName || (user as any)?.fullName || "",
      status: "completed",
      progress: 100,
      ...formData,
    };

    try {
      if (inspectionId) {
        await updateMutation.mutateAsync({ id: inspectionId, data: inspectionData });
      } else {
        const newInspection = await createMutation.mutateAsync(inspectionData);
        // Navigate to history with the new inspection ID for new inspections
        setLocation(`/?id=${(newInspection as any).id}`);
        return;
      }
      
      // Navigate to history with existing inspection ID
      setLocation(`/?id=${inspectionId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit inspection. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateProgress = () => {
    const sections = ["general", "sprinkler", "standpipe", "pump", "valves", "final"];
    const completedSections = sections.filter(section => {
      // Basic completion check - in real app this would be more sophisticated
      if (section === "general") {
        return formData.facilityName && formData.address;
      }
      if (section === "sprinkler") {
        return formData.systemCounts && (formData.systemCounts as any)?.sprinklerSystemType;
      }
      if (section === "standpipe") {
        return formData.systemCounts && (formData.systemCounts as any)?.standpipeCompleted;
      }
      if (section === "pump") {
        return formData.systemCounts && (formData.systemCounts as any)?.pumpCompleted;
      }
      if (section === "valves") {
        return formData.systemCounts && (formData.systemCounts as any)?.valvesCompleted;
      }
      if (section === "final") {
        return formData.status === "completed";
      }
      return false;
    });
    return Math.round((completedSections.length / sections.length) * 100);
  };

  if (isLoading && inspectionId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="text-center">Loading inspection...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">NFPA 25 Inspection Form</h2>
              <p className="text-muted-foreground mt-2">
                Inspection, Testing & Maintenance of Water-Based Fire Protection Systems
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-draft"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                data-testid="button-submit"
              >
                <Check className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>

        {/* Form Progress */}
        <FormProgress 
          currentSection={currentSection}
          progress={calculateProgress()}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <SidebarNav 
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
              progress={calculateProgress()}
            />
          </div>

          {/* Main Form Content */}
          <div className="lg:col-span-3">
            <Card>
              {/* Form Header */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground">
                      {SECTION_TITLES[currentSection]}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {currentSection === "general" && "Basic facility and inspection details"}
                      {currentSection === "sprinkler" && "Sprinkler system testing and maintenance"}
                      {currentSection === "standpipe" && "Standpipe system inspection"}
                      {currentSection === "pump" && "Fire pump testing procedures"}
                      {currentSection === "valves" && "Control valve inspection"}
                      {currentSection === "final" && "Final inspection and certification"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span data-testid="text-autosave-status">Auto-saved 2 minutes ago</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {currentSection === "general" && (
                  <div className="space-y-8">
                    <FacilityInfo 
                      data={formData}
                      onChange={handleFormUpdate}
                      selectedCompany={selectedCompany}
                      onCompanyChange={handleCompanyChange}
                      isEditing={!!inspectionId}
                      canChangeCompany={!inspectionId || inspection?.status === "draft"}
                      companyError={companyError}
                    />
                    <InspectionDetails 
                      data={formData}
                      onChange={handleFormUpdate}
                      inspector={user as any}
                    />
                    <SystemOverview 
                      data={formData}
                      onChange={handleFormUpdate}
                    />
                  </div>
                )}

                {currentSection === "sprinkler" && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="sprinkler-system-type" className="text-sm font-medium">
                        Tipo de Sistema de Sprinkler *
                      </Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Selecione o tipo de sistema de sprinkler instalado na propriedade
                      </p>
                      <Select
                        value={(formData.systemCounts as any)?.sprinklerSystemType || ""}
                        onValueChange={(value) => {
                          const currentSystemCounts = (formData.systemCounts as any) || {};
                          handleFormUpdate({ 
                            systemCounts: { 
                              ...currentSystemCounts, 
                              sprinklerSystemType: value 
                            } 
                          });
                        }}
                      >
                        <SelectTrigger data-testid="select-sprinkler-system-type">
                          <SelectValue placeholder="Selecione o tipo de sistema..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wet" data-testid="option-wet">
                            Wet (Tubo Molhado)
                          </SelectItem>
                          <SelectItem value="dry" data-testid="option-dry">
                            Dry (Seco)
                          </SelectItem>
                          <SelectItem value="preaction" data-testid="option-preaction">
                            Preaction
                          </SelectItem>
                          <SelectItem value="deluge" data-testid="option-deluge">
                            Deluge
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentSection === "standpipe" && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Standpipe systems inspection section.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Mark this section as completed to continue.
                      </p>
                      <Button 
                        className="mt-4"
                        variant="outline"
                        onClick={() => {
                          const currentSystemCounts = (formData.systemCounts as any) || {};
                          handleFormUpdate({ 
                            systemCounts: { 
                              ...currentSystemCounts, 
                              standpipeCompleted: true 
                            } 
                          });
                        }}
                        data-testid="button-mark-standpipe-complete"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark Section Complete
                      </Button>
                    </div>
                  </div>
                )}

                {currentSection === "pump" && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Fire pump testing procedures section.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Mark this section as completed to continue.
                      </p>
                      <Button 
                        className="mt-4"
                        variant="outline"
                        onClick={() => {
                          const currentSystemCounts = (formData.systemCounts as any) || {};
                          handleFormUpdate({ 
                            systemCounts: { 
                              ...currentSystemCounts, 
                              pumpCompleted: true 
                            } 
                          });
                        }}
                        data-testid="button-mark-pump-complete"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark Section Complete
                      </Button>
                    </div>
                  </div>
                )}

                {currentSection === "valves" && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Control valve inspection section.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Mark this section as completed to continue.
                      </p>
                      <Button 
                        className="mt-4"
                        variant="outline"
                        onClick={() => {
                          const currentSystemCounts = (formData.systemCounts as any) || {};
                          handleFormUpdate({ 
                            systemCounts: { 
                              ...currentSystemCounts, 
                              valvesCompleted: true 
                            } 
                          });
                        }}
                        data-testid="button-mark-valves-complete"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark Section Complete
                      </Button>
                    </div>
                  </div>
                )}

                {currentSection === "final" && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Final inspection and certification
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Review and submit your completed inspection.
                      </p>
                    </div>
                  </div>
                )}

                {currentSection !== "general" && currentSection !== "sprinkler" && currentSection !== "standpipe" && currentSection !== "pump" && currentSection !== "valves" && currentSection !== "final" && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>This section is under development.</p>
                    <p className="text-sm mt-2">Complete the previous sections first.</p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                  <div className="flex items-center space-x-4">
                    {currentSection === "final" ? (
                      <>
                        <Button 
                          variant="ghost" 
                          onClick={handleSaveDraft}
                          disabled={createMutation.isPending || updateMutation.isPending}
                          data-testid="button-save-draft"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Draft
                        </Button>
                        <Button 
                          onClick={handleSubmitFinalInspection}
                          disabled={createMutation.isPending || updateMutation.isPending}
                          data-testid="button-submit"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Submit
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          onClick={handleSaveDraft}
                          disabled={createMutation.isPending || updateMutation.isPending}
                          data-testid="button-save-bottom"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save as Draft
                        </Button>
                        <Button 
                          variant="ghost"
                          data-testid="button-print-section"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Print Section
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline"
                      disabled={currentSection === "general"}
                      data-testid="button-previous"
                    >
                      Previous
                    </Button>
                    {currentSection !== "final" && (
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        onClick={
                          currentSection === "general" ? handleContinueToSprinkler :
                          currentSection === "sprinkler" ? handleContinueToStandpipe :
                          currentSection === "standpipe" ? handleContinueToPumpTesting :
                          currentSection === "pump" ? handleContinueToControlValves :
                          currentSection === "valves" ? handleContinueToFinalInspection :
                          () => {
                            const sections: FormSection[] = ["general", "sprinkler", "standpipe", "pump", "valves", "final"];
                            const currentIndex = sections.indexOf(currentSection);
                            if (currentIndex < sections.length - 1) {
                              setCurrentSection(sections[currentIndex + 1]);
                            }
                          }
                        }
                        data-testid="button-continue"
                      >
                        Continue to{" "}
                        {currentSection === "general" && "Sprinkler Systems"}
                        {currentSection === "sprinkler" && "Standpipe Systems"}
                        {currentSection === "standpipe" && "Pump Testing"}
                        {currentSection === "pump" && "Control Valves"}
                        {currentSection === "valves" && "Final Inspection"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Messages */}
            <div className="mt-6">
              <Alert className="border-primary/20 bg-primary/10">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  <strong>NFPA 25 Requirement:</strong> Weekly visual inspections are required for all sprinkler control valves and fire pump systems. Ensure all sections are completed before final submission.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
