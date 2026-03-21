import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CoordinatorProvider } from "@/lib/coordinator-context";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AddMember from "./pages/AddMember";
import MemberProfile from "./pages/MemberProfile";
import RecordContribution from "./pages/RecordContribution";
import CreditProfile from "./pages/CreditProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CoordinatorProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-member" element={<AddMember />} />
            <Route path="/member/:id" element={<MemberProfile />} />
            <Route path="/record-contribution/:id" element={<RecordContribution />} />
            <Route path="/credit-profile/:id" element={<CreditProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CoordinatorProvider>
  </QueryClientProvider>
);

export default App;
