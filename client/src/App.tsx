import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import InspectionForm from "@/pages/inspection-form";
import SprinklerModule from "@/pages/sprinkler-module";
import WetSprinklerForm from "@/pages/wet-sprinkler-form";
import DrySprinklerForm from "@/pages/dry-sprinkler-form";
import PreActionDelugeForm from "@/pages/preaction-deluge-form";
import FoamWaterForm from "@/pages/foam-water-form";
import WaterSprayForm from "@/pages/water-spray-form";
import WaterMistForm from "@/pages/water-mist-form";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/inspection/:id?" component={InspectionForm} />
      <Route path="/sprinkler-module" component={SprinklerModule} />
      <Route path="/sprinkler/wet-sprinkler" component={WetSprinklerForm} />
      <Route path="/sprinkler/dry-sprinkler" component={DrySprinklerForm} />
      <Route path="/sprinkler/preaction-deluge" component={PreActionDelugeForm} />
      <Route path="/sprinkler/foam-water" component={FoamWaterForm} />
      <Route path="/sprinkler/water-spray" component={WaterSprayForm} />
      <Route path="/sprinkler/water-mist" component={WaterMistForm} />
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
