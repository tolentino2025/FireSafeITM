import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user-dashboard";
import InspectionForm from "@/pages/inspection-form";
import MultiFormInspection from "@/pages/multi-form-inspection";
import SprinklerModule from "@/pages/sprinkler-module";
import WetSprinklerForm from "@/pages/wet-sprinkler-form";
import DrySprinklerForm from "@/pages/dry-sprinkler-form";
import PreActionDelugeForm from "@/pages/preaction-deluge-form";
import FoamWaterForm from "@/pages/foam-water-form";
import WaterSprayForm from "@/pages/water-spray-form";
import WaterMistForm from "@/pages/water-mist-form";
import PumpModule from "@/pages/pump-module";
import WeeklyPumpForm from "@/pages/weekly-pump-form";
import MonthlyPumpForm from "@/pages/monthly-pump-form";
import AnnualPumpForm from "@/pages/annual-pump-form";
import CertificatesModule from "@/pages/certificates-module";
import HazardEvaluationForm from "@/pages/hazard-evaluation-form";
import AboveGroundCertificateForm from "@/pages/above-ground-certificate-form";
import UndergroundCertificateForm from "@/pages/underground-certificate-form";
import StandpipeModule from "@/pages/standpipe-module";
import StandpipeHoseForm from "@/pages/standpipe-hose-form";
import FireServiceMainsForm from "@/pages/fire-service-mains-form";
import HydrantFlowTestForm from "@/pages/hydrant-flow-test-form";
import WaterTankForm from "@/pages/water-tank-form";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/painel-controle" component={UserDashboard} />
      <Route path="/inspection/:id?" component={InspectionForm} />
      <Route path="/multi-inspection/:inspectionId?" component={MultiFormInspection} />
      <Route path="/sprinkler-module" component={SprinklerModule} />
      <Route path="/sprinkler/wet-sprinkler" component={WetSprinklerForm} />
      <Route path="/sprinkler/dry-sprinkler" component={DrySprinklerForm} />
      <Route path="/sprinkler/preaction-deluge" component={PreActionDelugeForm} />
      <Route path="/sprinkler/foam-water" component={FoamWaterForm} />
      <Route path="/sprinkler/water-spray" component={WaterSprayForm} />
      <Route path="/sprinkler/water-mist" component={WaterMistForm} />
      <Route path="/pump-module" component={PumpModule} />
      <Route path="/weekly-pump-form" component={WeeklyPumpForm} />
      <Route path="/monthly-pump-form" component={MonthlyPumpForm} />
      <Route path="/annual-pump-form" component={AnnualPumpForm} />
      <Route path="/certificates-module" component={CertificatesModule} />
      <Route path="/hazard-evaluation-form" component={HazardEvaluationForm} />
      <Route path="/above-ground-certificate-form" component={AboveGroundCertificateForm} />
      <Route path="/underground-certificate-form" component={UndergroundCertificateForm} />
      <Route path="/standpipe-module" component={StandpipeModule} />
      <Route path="/standpipe-hose-form" component={StandpipeHoseForm} />
      <Route path="/fire-service-mains-form" component={FireServiceMainsForm} />
      <Route path="/hydrant-flow-test-form" component={HydrantFlowTestForm} />
      <Route path="/water-tank-form" component={WaterTankForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
