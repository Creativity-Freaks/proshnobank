import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy load admin pages
const AdminOverview = lazy(() => import("@/pages/admin/AdminOverview"));
const AdminQuestions = lazy(() => import("@/pages/admin/AdminQuestions"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));

const AdminFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background font-bengali">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function AdminShell() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/overview" element={<AdminOverview />} />
        <Route path="/categories" element={<AdminOverview />} />
        <Route path="/subjects" element={<AdminOverview />} />
        <Route path="/chapters" element={<AdminOverview />} />
        <Route path="/questions" element={<AdminQuestions />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
