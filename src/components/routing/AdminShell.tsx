import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy load admin pages
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminOverview = lazy(() => import("@/pages/admin/AdminOverview"));

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
        <Route path="/dashboard" element={<AdminOverview />} />
        <Route path="/overview" element={<AdminOverview />} />
        <Route path="/categories" element={<AdminOverview />} />
        <Route path="/subcategories" element={<AdminOverview />} />
        <Route path="/subjects" element={<AdminOverview />} />
        <Route path="/chapters" element={<AdminOverview />} />
        <Route path="/questions" element={<AdminOverview />} />
        <Route path="/users" element={<AdminOverview />} />
        <Route path="/templates" element={<AdminOverview />} />
        <Route path="/live-events" element={<AdminOverview />} />
        <Route path="/analytics" element={<AdminOverview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
