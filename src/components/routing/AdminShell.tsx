import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy load admin pages
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminOverview = lazy(() => import("@/pages/admin/AdminOverview"));
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));

const AdminFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background font-bengali">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function AdminShell() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/overview" element={<AdminDashboard />} />
        <Route path="/categories" element={<AdminDashboard />} />
        <Route path="/subcategories" element={<AdminDashboard />} />
        <Route path="/subjects" element={<AdminDashboard />} />
        <Route path="/chapters" element={<AdminDashboard />} />
        <Route path="/questions" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminDashboard />} />
        <Route path="/templates" element={<AdminDashboard />} />
        <Route path="/live-events" element={<AdminDashboard />} />
        <Route path="/analytics" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
