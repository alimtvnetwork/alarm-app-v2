import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import AlarmOverlay from "./components/alarm/AlarmOverlay";
import KeyboardShortcutsHelp from "./components/layout/KeyboardShortcutsHelp";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Sleep from "./pages/Sleep";
import Personalization from "./pages/Personalization";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppInner = () => {
  useKeyboardShortcuts();
  return (
    <>
      <Toaster />
      <Sonner />
      <AlarmOverlay />
      <KeyboardShortcutsHelp />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/personalization" element={<Personalization />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>

export default App;
      <Toaster />
      <Sonner />
      <AlarmOverlay />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/personalization" element={<Personalization />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
