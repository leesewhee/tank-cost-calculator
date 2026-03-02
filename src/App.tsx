import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TankQuotation from "./pages/Index";
import DocumentManagement from "./pages/DocumentManagement";
import DrawingRevision from "./pages/DrawingRevision";
import LadderHandrailStandard from "./pages/LadderHandrailStandard";
import NCRReport from "./pages/NCRReport";
import NotFound from "./pages/NotFound";
import BoltReferenceTable from "./pages/BoltReferenceTable";
import {
  BoltCalculatorPage,
  FRPCalculatorPage,
  WeightCalculatorPage,
  HandrailCalculatorPage,
  TankVolumeCalculatorPage,
  FlangeSpecPage,
  FlangeTorquePage,
  MaterialPropertiesPage,
  ChemicalResistancePage,
} from "./pages/EngineeringTools";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tank-quotation" element={<TankQuotation />} />
          <Route path="/drawing-revision" element={<DrawingRevision />} />
          <Route path="/ladder-handrail" element={<LadderHandrailStandard />} />
          <Route path="/ncr-report" element={<NCRReport />} />
          <Route path="/bolt-calculator" element={<BoltCalculatorPage />} />
          <Route path="/bolt-reference" element={<BoltReferenceTable />} />
          <Route path="/frp-calculator" element={<FRPCalculatorPage />} />
          <Route path="/weight-calculator" element={<WeightCalculatorPage />} />
          <Route path="/handrail-calculator" element={<HandrailCalculatorPage />} />
          <Route path="/tank-volume-calculator" element={<TankVolumeCalculatorPage />} />
          <Route path="/flange-spec" element={<FlangeSpecPage />} />
          <Route path="/flange-torque" element={<FlangeTorquePage />} />
          <Route path="/material-properties" element={<MaterialPropertiesPage />} />
          <Route path="/chemical-resistance" element={<ChemicalResistancePage />} />
          <Route path="/document-management" element={<DocumentManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
