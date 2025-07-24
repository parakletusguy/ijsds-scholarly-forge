import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Articles } from "./pages/Articles";
import { Submit } from "./pages/Submit";
import { Dashboard } from "./pages/Dashboard";
import { Editorial } from "./pages/Editorial";
import { ReviewAssignment } from "./pages/ReviewAssignment";
import { ReviewerDashboard } from "./pages/ReviewerDashboard";
import { ReviewForm } from "./pages/ReviewForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editorial" element={<Editorial />} />
            <Route path="/review-assignment/:submissionId" element={<ReviewAssignment />} />
            <Route path="/reviewer-dashboard" element={<ReviewerDashboard />} />
            <Route path="/review/:reviewId" element={<ReviewForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
