import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SystemSelector } from "@/components/inspection/system-selector";
import { Link, useLocation } from "wouter";
import { Inspection } from "@shared/schema";
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus,
  Droplets,
  Wind,
  Building2,
  Settings,
  AlertTriangle,
  FileCheck
} from "lucide-react";

export default function Dashboard() {
  const [showSystemSelector, setShowSystemSelector] = useState(false);
  const [, navigate] = useLocation();
  
  const { data: inspections, isLoading } = useQuery<Inspection[]>({
    queryKey: ["/api/inspections"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleStartInspection = (selectedSystems: string[], selectedForms: string[]) => {
    // Navigate to multi-form inspection with selected forms
    navigate(`/multi-inspection?forms=${selectedForms.join(',')}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const recentInspections = inspections?.slice(0, 5) || [];
  const completedInspections = inspections?.filter(i => i.status === "completed").length || 0;
  const draftInspections = inspections?.filter(i => i.status === "draft").length || 0;
  const overdueInspections = inspections?.filter(i => {
    const dueDate = new Date(i.nextInspectionDue || '');
    return dueDate < new Date() && i.status !== "completed";
  }).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {(user as any)?.fullName || 'Inspector'}
            </h1>
            <p className="text-muted-foreground mt-2">
              NFPA 25 Inspection Management Dashboard
            </p>
          </div>
          <Button 
            onClick={() => setShowSystemSelector(true)}
            data-testid="button-new-inspection" 
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Inspection
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-inspections">
                {inspections?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All time inspections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-completed-inspections">
                {completedInspections}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-draft-inspections">
                {draftInspections}
              </div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive" data-testid="text-overdue-inspections">
                {overdueInspections}
              </div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Inspections */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Inspections
                  <Badge variant="secondary" data-testid="badge-total-count">
                    {recentInspections.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInspections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No inspections yet. Create your first inspection to get started.</p>
                    </div>
                  ) : (
                    recentInspections.map((inspection) => (
                      <div 
                        key={inspection.id} 
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        data-testid={`card-inspection-${inspection.id}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-card-foreground">
                            {inspection.facilityName}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span>{inspection.inspectionType} inspection</span>
                            <span>•</span>
                            <span>{new Date(inspection.inspectionDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={inspection.status === "completed" ? "default" : "secondary"}
                            data-testid={`badge-status-${inspection.id}`}
                          >
                            {inspection.status}
                          </Badge>
                          <Link href={`/inspection/${inspection.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              data-testid={`button-view-${inspection.id}`}
                            >
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & System Types */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowSystemSelector(true)}
                  data-testid="button-start-inspection"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Inspection
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  data-testid="button-view-reports"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  data-testid="button-schedule-inspection"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Inspection
                </Button>
              </CardContent>
            </Card>

            {/* System Types Overview */}
            <Card>
              <CardHeader>
                <CardTitle>System Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-5 h-5 text-primary" />
                    <span className="font-medium">Wet Systems</span>
                  </div>
                  <Badge variant="secondary">Most Common</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wind className="w-5 h-5 text-primary" />
                    <span className="font-medium">Dry Systems</span>
                  </div>
                  <Badge variant="outline">Special Care</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">Standpipes</span>
                  </div>
                  <Badge variant="outline">Annual</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-primary" />
                    <span className="font-medium">Fire Pumps</span>
                  </div>
                  <Badge variant="outline">Critical</Badge>
                </div>
                
                <Link href="/certificates-module">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileCheck className="w-5 h-5 text-primary" />
                      <span className="font-medium">Certificates & Evaluations</span>
                    </div>
                    <Badge variant="outline">NFPA 25</Badge>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* System Selector Modal */}
      <SystemSelector
        open={showSystemSelector}
        onOpenChange={setShowSystemSelector}
        onStartInspection={handleStartInspection}
      />
    </div>
  );
}
