import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import AppErrorBoundary from "@/components/routing/AppErrorBoundary";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import TeacherRoute from "@/components/routing/TeacherRoute";
import StudentRoute from "@/components/routing/StudentRoute";
import AdminRoute from "@/components/routing/AdminRoute";
import PublicLayout from "@/components/routing/PublicLayout";
import AuthLayout from "@/components/routing/AuthLayout";
import AdminShell from "@/components/routing/AdminShell";
import TeacherShell from "@/components/teacher/TeacherShell";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const TeacherLogin = lazy(() => import("./pages/teacher/TeacherLogin"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Register = lazy(() => import("./pages/Register"));
const TeacherRegister = lazy(() => import("./pages/teacher/TeacherRegister"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const QuestionBank = lazy(() => import("./pages/QuestionBank"));
const QuestionBankPdfCategory = lazy(() => import("./pages/QuestionBankPdfCategory"));
const ExamBatches = lazy(() => import("./pages/Exambatch/ExamBatches"));
const SSCExamBatches = lazy(() => import("./pages/Exambatch/SSCExamBatches"));
const HSCExamBatches = lazy(() => import("./pages/Exambatch/HSCExamBatches"));
const AdmissionExamBatches = lazy(() => import("./pages/Exambatch/AdmissionExamBatches"));
const ChakriExamBatches = lazy(() => import("./pages/Exambatch/ChakriExamBatches"));
const ExamBatchesCategory = lazy(() => import("./pages/Exambatch/ExamBatchesCategory"));
const ExamBatchDetails = lazy(() => import("./pages/Exambatch/ExamBatchDetails"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const LiveExams = lazy(() => import("./pages/LiveExams"));
const ExamTake = lazy(() => import("./pages/ExamTake"));
const ExamDetails = lazy(() => import("./pages/ExamDetails"));
const ExamSetup = lazy(() => import("./pages/ExamSetup"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const SSCExams = lazy(() => import("./pages/categories/SSCExams"));
const HSCExams = lazy(() => import("./pages/categories/HSCExams"));
const MedicalExams = lazy(() => import("./pages/categories/MedicalExams"));
const EngineeringExams = lazy(() => import("./pages/categories/EngineeringExams"));
const UniversityExams = lazy(() => import("./pages/categories/UniversityExams"));
const JobExams = lazy(() => import("./pages/categories/JobExams"));
const Profile = lazy(() => import("./pages/Profile"));
const ExamHistory = lazy(() => import("./pages/ExamHistory"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppErrorBoundary>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/question-bank" element={<QuestionBank />} />
                <Route path="/question-bank/pdfs/:category" element={<QuestionBankPdfCategory />} />
                <Route path="/batches" element={<ExamBatches />} />
                <Route path="/batches/ssc" element={<SSCExamBatches />} />
                <Route path="/batches/hsc" element={<HSCExamBatches />} />
                <Route path="/batches/admission" element={<AdmissionExamBatches />} />
                <Route path="/batches/chakri" element={<ChakriExamBatches />} />
                <Route path="/batches/:slug/:batchId" element={<ExamBatchDetails />} />
                <Route path="/batches/:slug" element={<ExamBatchesCategory />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/live-exams" element={<LiveExams />} />
                <Route path="/exam/setup" element={<ExamSetup />} />
                <Route path="/exam/:id" element={<ExamDetails />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

                <Route
                  path="/dashboard"
                  element={
                    <StudentRoute>
                      <Dashboard />
                    </StudentRoute>
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
                  path="/exam-history"
                  element={
                    <StudentRoute>
                      <ExamHistory />
                    </StudentRoute>
                  }
                />

                <Route path="/category/ssc" element={<SSCExams />} />
                <Route path="/category/hsc" element={<HSCExams />} />
                <Route path="/category/medical" element={<MedicalExams />} />
                <Route path="/category/engineering" element={<EngineeringExams />} />
                <Route path="/category/university" element={<UniversityExams />} />
                <Route path="/category/job" element={<JobExams />} />
              </Route>

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/teacher-login" element={<TeacherLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/teacher-register" element={<TeacherRegister />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/exam/:id/take" element={<ExamTake />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminShell />
                  </AdminRoute>
                }
              />

              {/* Teacher routes (dedicated full-screen shell) */}
              <Route element={<TeacherShell />}>
                <Route
                  path="/teacher-dashboard"
                  element={
                    <TeacherRoute>
                      <TeacherDashboard />
                    </TeacherRoute>
                  }
                />
              </Route>
            </Routes>
          </AppErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
