import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import AlarmOverlay from "./components/alarm/AlarmOverlay";
import AlarmChecker from "./components/alarm/AlarmChecker";
import KeyboardShortcutsHelp from "./components/layout/KeyboardShortcutsHelp";
import OnboardingModal from "./components/onboarding/OnboardingModal";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import Index from "./pages/Index";
import Alarms from "./pages/Alarms";
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
      <AlarmChecker />
      <KeyboardShortcutsHelp />
      <OnboardingModal />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/alarms" element={<Alarms />} />
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
);

export default App;
