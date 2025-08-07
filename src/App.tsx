import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Articles } from "./pages/Articles";
import { Submit } from "./pages/Submit";
import { Dashboard } from "./pages/Dashboard";
import { Editorial } from "./pages/Editorial";
import { ReviewAssignment } from "./pages/ReviewAssignment";
import { ReviewerDashboard } from "./pages/ReviewerDashboard";
import { ReviewForm } from "./pages/ReviewForm";
import { Publication } from "./pages/Publication";
import { Production } from "./pages/Production";
import { Analytics } from "./pages/Analytics";
import { Profile } from "./pages/Profile";
import { About } from "./pages/About";
import Copyright from "./pages/Copyright";
import EditorialBoard from "./pages/EditorialBoard";
import { SubmissionGuidelines } from "./pages/SubmissionGuidelines";
import { PeerReview } from "./pages/PeerReview";
import { ExternalIntegrations } from "./pages/ExternalIntegrations";
import { DataManagement } from "./pages/DataManagement";
import { SubmissionDetail } from "./pages/SubmissionDetail";
import { Reports } from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
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
              <Route path="/publication" element={<Publication />} />
              <Route path="/production" element={<Production />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/data-management" element={<DataManagement />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/copyright" element={<Copyright />} />
              <Route path="/editorial-board" element={<EditorialBoard />} />
              <Route path="/submission-guidelines" element={<SubmissionGuidelines />} />
              <Route path="/peer-review" element={<PeerReview />} />
              <Route path="/external-integrations" element={<ExternalIntegrations />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/submission/:submissionId/details" element={<SubmissionDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
