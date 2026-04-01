// Auth-enabled application entry point
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import AdminRoute from "@/components/routing/AdminRoute";
import TeacherRoute from "@/components/routing/TeacherRoute";
import AppErrorBoundary from "@/components/routing/AppErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const QuestionBank = lazy(() => import("./pages/QuestionBank"));
const ExamBatches = lazy(() => import("./pages/ExamBatches"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const LiveExams = lazy(() => import("./pages/LiveExams"));
const ExamTake = lazy(() => import("./pages/ExamTake"));
const ExamDetails = lazy(() => import("./pages/ExamDetails"));
const ExamSetup = lazy(() => import("./pages/ExamSetup"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const SSCExams = lazy(() => import("./pages/categories/SSCExams"));
const HSCExams = lazy(() => import("./pages/categories/HSCExams"));
const MedicalExams = lazy(() => import("./pages/categories/MedicalExams"));
const EngineeringExams = lazy(() => import("./pages/categories/EngineeringExams"));
const UniversityExams = lazy(() => import("./pages/categories/UniversityExams"));
const JobExams = lazy(() => import("./pages/categories/JobExams"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background font-bengali">
    <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-dashboard"
                element={
                  <TeacherRoute>
                    <TeacherDashboard />
                  </TeacherRoute>
                }
              />
              <Route path="/question-bank" element={<QuestionBank />} />
              <Route path="/batches" element={<ExamBatches />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/live-exams" element={<LiveExams />} />
              <Route path="/exam/setup" element={<ExamSetup />} />
              <Route path="/exam/:id" element={<ExamDetails />} />
              <Route path="/exam/:id/take" element={<ExamTake />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/category/ssc" element={<SSCExams />} />
              <Route path="/category/hsc" element={<HSCExams />} />
              <Route path="/category/medical" element={<MedicalExams />} />
              <Route path="/category/engineering" element={<EngineeringExams />} />
              <Route path="/category/university" element={<UniversityExams />} />
              <Route path="/category/job" element={<JobExams />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
