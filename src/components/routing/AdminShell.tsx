import { Suspense, lazy } from "react";

const AdminWorkspace = lazy(() => import("@/components/admin/AdminWorkspace"));

const AdminFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background font-bengali">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function AdminShell() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminWorkspace />
    </Suspense>
  );
}
