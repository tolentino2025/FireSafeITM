import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Inspection, InsertInspection } from "@shared/schema";
import { Save, Check, ExternalLink, Clock } from "lucide-react";

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
  const inspectionId = params?.id;
  const [currentSection, setCurrentSection] = useState<FormSection>("general");
  const [formData, setFormData] = useState<Partial<InsertInspection>>({});
  const { toast } = useToast();

  const { data: inspection, isLoading } = useQuery<Inspection>({
    queryKey: ["/api/inspections", inspectionId],
    enabled: !!inspectionId,
  });

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

  const handleSaveDraft = () => {
    const inspectionData: InsertInspection = {
      facilityName: formData.facilityName || "",
      address: formData.address || "",
      inspectionDate: formData.inspectionDate || new Date(),
      inspectionType: formData.inspectionType || "weekly",
      inspectorId: user?.id || "default-user-id",
      inspectorName: formData.inspectorName || user?.fullName || "",
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

  const calculateProgress = () => {
    const sections = ["general", "sprinkler", "standpipe", "pump", "valves", "final"];
    const completedSections = sections.filter(section => {
      // Basic completion check - in real app this would be more sophisticated
      return section === "general" && formData.facilityName && formData.address;
    });
    return Math.round((completedSections.length / sections.length) * 100);
  };

  if (isLoading && inspectionId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading inspection...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    />
                    <InspectionDetails 
                      data={formData}
                      onChange={handleFormUpdate}
                      inspector={user}
                    />
                    <SystemOverview 
                      data={formData}
                      onChange={handleFormUpdate}
                    />
                  </div>
                )}

                {currentSection !== "general" && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>This section is under development.</p>
                    <p className="text-sm mt-2">Complete the General Information section first.</p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                  <div className="flex items-center space-x-4">
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
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline"
                      disabled={currentSection === "general"}
                      data-testid="button-previous"
                    >
                      Previous
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      disabled={currentSection === "final"}
                      onClick={() => {
                        const sections: FormSection[] = ["general", "sprinkler", "standpipe", "pump", "valves", "final"];
                        const currentIndex = sections.indexOf(currentSection);
                        if (currentIndex < sections.length - 1) {
                          setCurrentSection(sections[currentIndex + 1]);
                        }
                      }}
                      data-testid="button-continue"
                    >
                      Continue to{" "}
                      {currentSection === "general" && "Sprinkler Systems"}
                      {currentSection === "sprinkler" && "Standpipe Systems"}
                      {currentSection === "standpipe" && "Pump Testing"}
                      {currentSection === "pump" && "Control Valves"}
                      {currentSection === "valves" && "Final Inspection"}
                    </Button>
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
