import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Footer } from "@/components/layout/Footer";
import { Auth } from './pages/Auth';
const Index = lazy(() => import('./pages/Index'));
const Articles = lazy(() => import('./pages/Articles').then(m => ({ default: m.Articles })));
const Submit = lazy(() => import('./pages/Submit').then(m => ({ default: m.Submit })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Editorial = lazy(() => import('./pages/Editorial').then(m => ({ default: m.Editorial })));
const ReviewAssignment = lazy(() => import('./pages/ReviewAssignment').then(m => ({ default: m.ReviewAssignment })));
const ReviewerDashboard = lazy(() => import('./pages/ReviewerDashboard').then(m => ({ default: m.ReviewerDashboard })));
const ReviewForm = lazy(() => import('./pages/ReviewForm').then(m => ({ default: m.ReviewForm })));
const Publication = lazy(() => import('./pages/Publication').then(m => ({ default: m.Publication })));
const Production = lazy(() => import('./pages/Production').then(m => ({ default: m.Production })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Copyright = lazy(() => import('./pages/Copyright'));
const EditorialBoard = lazy(() => import('./pages/EditorialBoard'));
const SubmissionGuidelines = lazy(() => import('./pages/SubmissionGuidelines').then(m => ({ default: m.SubmissionGuidelines })));
const PeerReview = lazy(() => import('./pages/PeerReview').then(m => ({ default: m.PeerReview })));
const ExternalIntegrations = lazy(() => import('./pages/ExternalIntegrations').then(m => ({ default: m.ExternalIntegrations })));
const DataManagement = lazy(() => import('./pages/DataManagement').then(m => ({ default: m.DataManagement })));
const SubmissionDetail = lazy(() => import('./pages/SubmissionDetail').then(m => ({ default: m.SubmissionDetail })));
const SubmissionReviews = lazy(() => import('./pages/SubmissionReviews').then(m => ({ default: m.SubmissionReviews })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const RevisionSubmissionPortal = lazy(() => import('./components/revisions/RevisionSubmissionPortal').then(m => ({ default: m.RevisionSubmissionPortal })));
const NotFound = lazy(() => import('./pages/NotFound'));
const SystemSettings = lazy(() => import('./pages/SystemSettings').then(m => ({ default: m.SystemSettings })));
const ManageRequests = lazy(() => import('./pages/approveRequest').then(m => ({ default: m.ManageRequests })));
const Landing = lazy(() => import('./pages/landingPage').then(m => ({ default: m.Landing })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const ArticleInfo = lazy(() => import('./pages/articleInfo').then(m => ({ default: m.ArticleInfo })));
const Guide = lazy(() => import('./pages/guide').then(m => ({ default: m.Guide })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then(m => ({ default: m.BlogPost })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const Partners = lazy(() => import('./pages/Partners').then(m => ({ default: m.Partners })));
const BlogAdmin = lazy(() => import('./components/blog/BlogAdmin').then(m => ({ default: m.BlogAdmin })));
const PartnersAdmin = lazy(() => import('./components/partners/PartnersAdmin').then(m => ({ default: m.PartnersAdmin })));
const ReviewerDetail = lazy(() => import('./pages/reviewersDetails').then(m => ({ default: m.ReviewerDetail })));
const OpenAccessPage = lazy(() => import('./pages/openAccessPage'));
const PlagiarismPolicy = lazy(() => import('./pages/PlagiarismPolicy').then(m => ({ default: m.PlagiarismPolicy })));
const PreservationPolicy = lazy(() => import('./pages/PreservationPolicy').then(m => ({ default: m.PreservationPolicy })));
const Indexing = lazy(() => import('./pages/Indexing').then(m => ({ default: m.Indexing })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const EthicalGuidelines = lazy(() => import('./pages/EthicalGuidelines').then(m => ({ default: m.EthicalGuidelines })));
const AdminBlogManagement = lazy(() => import('./pages/AdminBlogManagement').then(m => ({ default: m.AdminBlogManagement })));
const EditBlogPost = lazy(() => import('./pages/EditBlogPost').then(m => ({ default: m.EditBlogPost })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
import { HelmetProvider } from 'react-helmet-async';
import { Button } from "./components/ui/button";
import { Link } from "react-router-dom";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes before data is considered stale
      gcTime: 1000 * 60 * 60 * 24, // Keep unused data in cache for 24 hours
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="fixed top-0 right-0 left-0 md:left-72 h-20 bg-[#fdf9f5]/80 backdrop-blur-md flex justify-between items-center px-12 z-40 border-b-[0.5px] border-[#ddc0b8]/15">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Link to={"/openAccess"} className="ml-4 md:ml-8">
              <Button variant="outline" className="text-xs uppercase tracking-widest border-primary/20 hover:bg-primary/5 text-primary">
                Open Access Notice
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="w-12 md:w-16">
              <img src="/riversstate-removebg-preview.png" alt="Rivers State University Logo" className="w-full h-auto" />
            </div>
          </div>
        </header>
        <main className="flex-1 mt-24">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  </SidebarProvider>
);

import { PublicLayout } from "@/components/layout/PublicLayout";
import { TechSupportWidget } from "@/components/support/TechSupportWidget";

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <HelmetProvider>
            <Toaster />
            <Sonner />
            <div className="font-Roboto bg-[#fffdfa]">
              <BrowserRouter>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
                  <Routes>
                    {/* ── Public Routes (Sidebar-Free) ────────────────────────────────── */}
                    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                    <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                    <Route path="/articles" element={<PublicLayout><Articles /></PublicLayout>} />
                    <Route path="/article/:slug" element={<PublicLayout><ArticleInfo /></PublicLayout>} />
                    <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
                    <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
                    <Route path="/partners" element={<PublicLayout><Partners /></PublicLayout>} />
                    <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                    <Route path="/openAccess" element={<PublicLayout><OpenAccessPage /></PublicLayout>} />
                    <Route path="/plagiarism-policy" element={<PublicLayout><PlagiarismPolicy /></PublicLayout>} />
                    <Route path="/ethical-guidelines" element={<PublicLayout><EthicalGuidelines /></PublicLayout>} />
                    <Route path="/preservation-policy" element={<PublicLayout><PreservationPolicy /></PublicLayout>} />
                    <Route path="/indexing" element={<PublicLayout><Indexing /></PublicLayout>} />
                    <Route path="/copyright" element={<PublicLayout><Copyright /></PublicLayout>} />
                    <Route path="/orcidGuide" element={<PublicLayout><Guide /></PublicLayout>} />
                    <Route path="/auth" element={<PublicLayout><Auth /></PublicLayout>} />
                    <Route path="/auth/callback" element={<PublicLayout><AuthCallback /></PublicLayout>} />
                    <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

                    {/* ── Protected Routes (With Sidebar) ──────────────────────────────── */}
                    <Route path="/submit" element={<PageLayout><Submit /></PageLayout>} />
                    <Route path="/dashboard" element={<PageLayout><Dashboard /></PageLayout>} />
                    <Route path="/editorial" element={<PageLayout><Editorial /></PageLayout>} />
                    <Route path="/review-assignment/:submissionId" element={<PageLayout><ReviewAssignment /></PageLayout>} />
                    <Route path="/reviewer-dashboard" element={<PageLayout><ReviewerDashboard /></PageLayout>} />
                    <Route path="/reviewerSubmission/:submissionId/details" element={<PageLayout><ReviewerDetail /></PageLayout>} />
                    <Route path="/review/:reviewId" element={<PageLayout><ReviewForm /></PageLayout>} />
                    <Route path="/publication" element={<PageLayout><Publication /></PageLayout>} />
                    <Route path="/production" element={<PageLayout><Production /></PageLayout>} />
                    <Route path="/analytics" element={<PageLayout><Analytics /></PageLayout>} />
                    <Route path="/data-management" element={<PageLayout><DataManagement /></PageLayout>} />
                    <Route path="/profile" element={<PageLayout><Profile /></PageLayout>} />
                    <Route path="/reports" element={<PageLayout><Reports /></PageLayout>} />
                    <Route path="/submission/:submissionId/details" element={<PageLayout><SubmissionDetail /></PageLayout>} />
                    <Route path="/submission/:submissionId/reviews" element={<PageLayout><SubmissionReviews /></PageLayout>} />
                    <Route path="/submission/:submissionId/revision" element={<PageLayout><RevisionSubmissionPortal /></PageLayout>} />
                    <Route path="/requests" element={<PageLayout><ManageRequests /></PageLayout>} />
                    <Route path="/system-settings" element={<PageLayout><SystemSettings /></PageLayout>} />
                    <Route path="/blog/admin" element={<PageLayout><BlogAdmin /></PageLayout>} />
                    <Route path="/partners/admin" element={<PageLayout><PartnersAdmin /></PageLayout>} />
                    <Route path="/admin" element={<PageLayout><AdminDashboard /></PageLayout>} />
                    <Route path="/admin/blog" element={<PageLayout><AdminBlogManagement /></PageLayout>} />
                    <Route path="/admin/blogs" element={<PageLayout><AdminBlogManagement /></PageLayout>} />
                    <Route path="/admin/blog/new" element={<PageLayout><EditBlogPost /></PageLayout>} />
                    <Route path="/admin/blogs/new" element={<PageLayout><EditBlogPost /></PageLayout>} />
                    <Route path="/admin/blog/edit/:id" element={<PageLayout><EditBlogPost /></PageLayout>} />
                    <Route path="/admin/blogs/edit/:id" element={<PageLayout><EditBlogPost /></PageLayout>} />

                    <Route path="/editorial-board" element={<Navigate to="/about" replace />} />
                    <Route path="/submission-guidelines" element={<PublicLayout><SubmissionGuidelines /></PublicLayout>} />
                    <Route path="/peer-review" element={<PublicLayout><PeerReview /></PublicLayout>} />

                    <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                  </Routes>
                </Suspense>
                <TechSupportWidget />
              </BrowserRouter>
            </div>
          </HelmetProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
