import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { GymProvider } from "@/context/GymContext";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Payment from "./pages/Payment";
import Admin from "./pages/Admin";
import Scan from "./pages/Scan";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

// Use HashRouter for Electron (file:// protocol doesn't work with BrowserRouter)
const isElectron = typeof window !== 'undefined' && (
  window.location.protocol === 'file:' ||
  navigator.userAgent.toLowerCase().includes('electron')
);
const Router = isElectron ? HashRouter : BrowserRouter;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GymProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment/:clientId" element={<Payment />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </GymProvider>
  </QueryClientProvider>
);

export default App;
