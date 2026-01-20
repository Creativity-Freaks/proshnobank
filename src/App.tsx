import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuestionBank from "./pages/QuestionBank";
import ExamBatches from "./pages/ExamBatches";
import Leaderboard from "./pages/Leaderboard";
import LiveExams from "./pages/LiveExams";
import ExamTake from "./pages/ExamTake";
import ExamDetails from "./pages/ExamDetails";
import ExamSetup from "./pages/ExamSetup";
import Teachers from "./pages/Teachers";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import SSCExams from "./pages/categories/SSCExams";
import HSCExams from "./pages/categories/HSCExams";
import MedicalExams from "./pages/categories/MedicalExams";
import EngineeringExams from "./pages/categories/EngineeringExams";
import UniversityExams from "./pages/categories/UniversityExams";
import JobExams from "./pages/categories/JobExams";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
