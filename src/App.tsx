import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Footer } from "@/components/layout/Footer";
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
import { SubmissionReviews } from "./pages/SubmissionReviews";
import { Reports } from "./pages/Reports";
import { RevisionSubmissionPortal } from "./components/revisions/RevisionSubmissionPortal";
import NotFound from "./pages/NotFound";
import { ManageRequests } from "./pages/approveRequest";
import { Landing } from "./pages/landingPage";

const queryClient = new QueryClient();

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-12 flex items-center border-b border-border bg-background p-4">
          <SidebarTrigger className="fixed z-30" />
        </header>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="font-Roboto">
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<PageLayout><Landing /></PageLayout>} />
              <Route path="/auth" element={<PageLayout><Auth /></PageLayout>} />
              <Route path="/articles" element={<PageLayout><Articles /></PageLayout>} />
              <Route path="/submit" element={<PageLayout><Submit /></PageLayout>} />
              <Route path="/dashboard" element={<PageLayout><Dashboard /></PageLayout>} />
              <Route path="/editorial" element={<PageLayout><Editorial /></PageLayout>} />
              <Route path="/review-assignment/:submissionId" element={<PageLayout><ReviewAssignment /></PageLayout>} />
              <Route path="/reviewer-dashboard" element={<PageLayout><ReviewerDashboard /></PageLayout>} />
              <Route path="/review/:reviewId" element={<PageLayout><ReviewForm /></PageLayout>} />
              <Route path="/publication" element={<PageLayout><Publication /></PageLayout>} />
              <Route path="/production" element={<PageLayout><Production /></PageLayout>} />
              <Route path="/analytics" element={<PageLayout><Analytics /></PageLayout>} />
              <Route path="/data-management" element={<PageLayout><DataManagement /></PageLayout>} />
              <Route path="/profile" element={<PageLayout><Profile /></PageLayout>} />
              <Route path="/about" element={<PageLayout><About /></PageLayout>} />
              <Route path="/copyright" element={<PageLayout><Copyright /></PageLayout>} />
              <Route path="/editorial-board" element={<PageLayout><EditorialBoard /></PageLayout>} />
              <Route path="/submission-guidelines" element={<PageLayout><SubmissionGuidelines /></PageLayout>} />
              <Route path="/peer-review" element={<PageLayout><PeerReview /></PageLayout>} />
              <Route path="/external-integrations" element={<PageLayout><ExternalIntegrations /></PageLayout>} />
              <Route path="/reports" element={<PageLayout><Reports /></PageLayout>} />
              <Route path="/submission/:submissionId/details" element={<PageLayout><SubmissionDetail /></PageLayout>} />
              <Route path="/submission/:submissionId/reviews" element={<PageLayout><SubmissionReviews /></PageLayout>} />
              <Route path="/submission/:submissionId/revision" element={<PageLayout><RevisionSubmissionPortal /></PageLayout>} />
              <Route path="/requests" element={<PageLayout><ManageRequests /></PageLayout>} />
              <Route path="/landing" element={<Landing/>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
            </Routes>
          </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
